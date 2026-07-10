export const GENLAYER_PATENT_CONTRACT = `# GenesisProof.py
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
#
# Genesis Proof — a GenLayer-native intelligent contract for creating, minting,
# and continuously auditing the authenticity of NFTs, plus a native marketplace
# that only ever trades tokens minted by this same contract.
#
# Design notes (read before modifying):
#
# - "list" / nested-object fields inside stored records (similar_works_found,
#   audit_history, challenge_history) are kept as JSON-encoded strings rather
#   than native nested collections. This mirrors the JSON-in/JSON-out pattern
#   already proven to work for AI responses in GenLayer contracts, and avoids
#   relying on nested dynamic-collection storage semantics that are harder to
#   verify ahead of time. Always json.loads() before reading, json.dumps()
#   before writing back.
#
# - Boolean-like flags are stored as u256(0)/u256(1) instead of Python bool,
#   matching the convention already used for is_approved-style fields in
#   GenLayer contracts of this shape.
#
# - Money never moves with a direct push transfer except via emit_transfer,
#   and even that is only ever called from claim_proceeds(), which follows
#   the checks-effects pattern (zero the balance before sending) to avoid
#   reentrancy.
#
# - Before relying on the deploy/upgrade GitHub Action, verify this contract
#   compiles and behaves as expected in GenLayer Studio first. GenLayer's
#   SDK surface (gl.nondet.*, gl.eq_principle.*, TreeMap, emit_transfer, etc.)
#   moves quickly; treat the exact method signatures below as "best current
#   understanding, please confirm against Studio" rather than gospel.

import json
import urllib.parse
from dataclasses import dataclass
from genlayer import *


# ---------------------------------------------------------------------------
# Storage records
# ---------------------------------------------------------------------------

@allow_storage
@dataclass
class NFT_Record:
    token_id: u256
    creator: Address              # original minter — permanent, never changes
    owner: Address                 # current holder — changes on transfer/sale
    title: str
    description: str
    media_url: str
    category: str
    minted_at: u256
    authenticity_score: u8         # 0-100, mutable over time
    authenticity_status: str       # VERIFIED_ORIGINAL | PROBABLE_ORIGINAL | UNVERIFIED | DISPUTED | REVOKED
    similar_works_found: str       # JSON-encoded list[str]
    parent_token_id: u256          # 0 means "no parent / not a derivative"
    is_derivative: u256            # 0/1 flag (0 means parent_token_id is not meaningful)
    derivative_similarity_score: u8
    royalty_bps_to_parent: u256    # basis points (0-10000) routed to the ORIGINAL creator of the lineage on every sale
    audit_history: str             # JSON-encoded list[dict]
    challenge_history: str         # JSON-encoded list[dict]
    last_audited_at: u256
    audit_count: u256


@allow_storage
@dataclass
class Listing:
    token_id: u256
    seller: Address
    price: u256
    listed_at: u256
    active: u256                   # 0/1 flag


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------

class NFTMinted(gl.Event):
    def __init__(self, token_id: u256, creator: Address, authenticity_status: str, /):
        ...

class MintRejected(gl.Event):
    def __init__(self, submitter: Address, reason: str, /):
        ...

class DerivativeMinted(gl.Event):
    def __init__(self, token_id: u256, parent_token_id: u256, similarity_score: u8, royalty_bps: u256, /):
        ...

class ProvenanceAudited(gl.Event):
    def __init__(self, token_id: u256, new_score: u8, /):
        ...

class CancelledListing(gl.Event):
    def __init__(self, token_id: u256, /):
        ...

class AuthenticityDisputed(gl.Event):
    def __init__(self, token_id: u256, new_score: u8, /):
        ...

class AuthenticityRevoked(gl.Event):
    def __init__(self, token_id: u256, /):
        ...

class AuthenticityChallenged(gl.Event):
    def __init__(self, token_id: u256, challenger: Address, outcome: str, /):
        ...

class NFTTransferred(gl.Event):
    def __init__(self, token_id: u256, frm: Address, to: Address, /):
        ...

class NFTListed(gl.Event):
    def __init__(self, token_id: u256, seller: Address, price: u256, /):
        ...

class ListingCancelled(gl.Event):
    def __init__(self, token_id: u256, /):
        ...

class NFTSold(gl.Event):
    def __init__(self, token_id: u256, buyer: Address, seller: Address, price: u256, fee: u256, royalty: u256, /):
        ...


# ---------------------------------------------------------------------------
# Contract
# ---------------------------------------------------------------------------

class GenesisProof(gl.Contract):
    nfts: TreeMap[u256, NFT_Record]
    token_count: u256

    listings: TreeMap[u256, Listing]

    pending_withdrawals: TreeMap[Address, u256]

    owner: Address
    mint_fee: u256
    marketplace_fee_bps: u256      # e.g. 250 = 2.5%
    treasury_balance: u256

    min_audit_interval: u256       # minimum "ticks" (block-count proxy) between audits of the same token

    def __init__(self):
        self.token_count = u256(0)
        self.owner = gl.message.sender_address
        self.mint_fee = u256(10)
        self.marketplace_fee_bps = u256(250)
        self.treasury_balance = u256(0)
        self.min_audit_interval = u256(1)

    # -----------------------------------------------------------------
    # Admin
    # -----------------------------------------------------------------

    @gl.public.write
    def set_mint_fee(self, new_fee: u256):
        if gl.message.sender_address != self.owner:
            raise Exception("Only the owner can update the mint fee.")
        self.mint_fee = new_fee

    @gl.public.write
    def set_marketplace_fee_bps(self, new_fee_bps: u256):
        if gl.message.sender_address != self.owner:
            raise Exception("Only the owner can update the marketplace fee.")
        if int(new_fee_bps) > 2000:
            raise Exception("Marketplace fee cannot exceed 20%.")
        self.marketplace_fee_bps = new_fee_bps

    # -----------------------------------------------------------------
    # Internal helpers
    # -----------------------------------------------------------------

    def _run_originality_check(self, title: str, description: str, media_url: str,
                                compare_against: dict | None = None) -> dict:
        """
        Runs the non-deterministic, web-grounded originality evaluation and
        reconciles it across validators via gl.eq_principle.prompt_comparative.
        Returns a plain dict with: originality_score (int), is_original (bool),
        closest_matches (list[str]), rationale (str), and, if compare_against
        was supplied, derivative_similarity_score (int).
        """

        def evaluate() -> str:
            query = f"{title[:60]} {description[:60]}"
            try:
                search_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
                web_context = gl.nondet.web.render(search_url, mode="text")[:600]
            except Exception:
                web_context = "No data"

            derivative_clause = ""
            if compare_against is not None:
                derivative_clause = (
                    f"\\nThis submission is claimed to be a derivative of an existing work:\\n"
                    f"Parent title: {compare_against.get('title', '')}\\n"
                    f"Parent description: {compare_against.get('description', '')}\\n"
                    "Also return 'derivative_similarity_score' (0-100): how much of the new "
                    "submission is a direct copy of the parent vs. a transformative new creation."
                )

            prompt = (
                f"Work title: {title}\\n"
                f"Description: {description}\\n"
                f"Media reference: {media_url}\\n"
                f"Relevant web search context (may be incomplete or noisy):\\n{web_context}\\n"
                f"{derivative_clause}\\n\\n"
                "Evaluate whether this work is original, or whether it (or something "
                "essentially identical to it) already exists elsewhere on the web, taking "
                "the search context into account when informative and ignoring it if it "
                "looks irrelevant or empty. Return JSON only, with this exact shape: "
                "{'originality_score': <int 0-100>, 'is_original': <true|false>, "
                "'closest_matches': [<string>, ...], 'rationale': '<string>'"
                + (", 'derivative_similarity_score': <int 0-100>" if compare_against is not None else "")
                + "}"
            )
            raw = gl.nondet.exec_prompt(prompt, response_format="json")

            try:
                data = json.loads(raw)
                out = {
                    "originality_score": int(data.get("originality_score", 0)),
                    "is_original": bool(data.get("is_original", False)),
                    "closest_matches": [str(x) for x in data.get("closest_matches", [])][:5],
                    "rationale": str(data.get("rationale", "")),
                }
                if compare_against is not None:
                    out["derivative_similarity_score"] = int(data.get("derivative_similarity_score", 100))
                return json.dumps(out)
            except Exception:
                fallback = {
                    "originality_score": 0,
                    "is_original": False,
                    "closest_matches": [],
                    "rationale": "Fallback: could not parse model output.",
                }
                if compare_against is not None:
                    fallback["derivative_similarity_score"] = 100
                return json.dumps(fallback)

        principle = (
            "The 'is_original' boolean must be identical across validators, unless the "
            "underlying web search context differs meaningfully between them (e.g. one got "
            "a result and another got 'No data'), in which case validators may disagree only "
            "if their evidence genuinely differs. Numeric scores must be within 3 points of "
            "each other to be considered equivalent."
        )

        consensus_raw = gl.eq_principle.prompt_comparative(evaluate, principle=principle)
        return json.loads(consensus_raw)

    def _apply_decay(self, old_score: u8, fresh_score: int) -> u8:
        decayed = round(int(old_score) * 0.7 + fresh_score * 0.3)
        decayed = max(0, min(100, decayed))
        return u8(decayed)

    # -----------------------------------------------------------------
    # Minting
    # -----------------------------------------------------------------

    @gl.public.write.payable
    def mint_nft(self, title: str, description: str, media_url: str, category: str) -> u256:
        sender = gl.message.sender_address
        sent_value = gl.message.value

        if sent_value < self.mint_fee:
            raise Exception("Insufficient mint fee.")

        overpay = u256(int(sent_value) - int(self.mint_fee))
        if int(overpay) > 0:
            self.pending_withdrawals[sender] = u256(int(self.pending_withdrawals.get(sender, u256(0))) + int(overpay))

        result = self._run_originality_check(title, description, media_url)
        score = result["originality_score"]
        is_original = result["is_original"]
        matches = result["closest_matches"]

        if (not is_original) or score < 40:
            # Mint rejected — refund the mint fee itself too (full refund of everything sent).
            self.pending_withdrawals[sender] = u256(int(self.pending_withdrawals.get(sender, u256(0))) + int(self.mint_fee))
            MintRejected(sender, "Insufficient originality / prior work found.").emit()
            raise Exception("Mint rejected: this work does not appear sufficiently original.")

        status = "VERIFIED_ORIGINAL" if score >= 85 else "PROBABLE_ORIGINAL"

        self.token_count = u256(int(self.token_count) + 1)
        token_id = self.token_count

        self.nfts[token_id] = NFT_Record(
            token_id=token_id,
            creator=sender,
            owner=sender,
            title=title,
            description=description,
            media_url=media_url,
            category=category,
            minted_at=u256(0),
            authenticity_score=u8(score),
            authenticity_status=status,
            similar_works_found=json.dumps(matches),
            parent_token_id=u256(0),
            is_derivative=u256(0),
            derivative_similarity_score=u8(0),
            royalty_bps_to_parent=u256(0),
            audit_history=json.dumps([]),
            challenge_history=json.dumps([]),
            last_audited_at=u256(0),
            audit_count=u256(0),
        )

        self.treasury_balance = u256(int(self.treasury_balance) + int(self.mint_fee))

        NFTMinted(token_id, sender, status).emit()
        return token_id

    @gl.public.write.payable
    def mint_derivative(self, parent_token_id: u256, title: str, description: str, media_url: str) -> u256:
        sender = gl.message.sender_address
        sent_value = gl.message.value

        if sent_value < self.mint_fee:
            raise Exception("Insufficient mint fee.")

        parent = self.nfts[parent_token_id]

        overpay = u256(int(sent_value) - int(self.mint_fee))
        if int(overpay) > 0:
            self.pending_withdrawals[sender] = u256(int(self.pending_withdrawals.get(sender, u256(0))) + int(overpay))

        result = self._run_originality_check(
            title, description, media_url,
            compare_against={"title": parent.title, "description": parent.description},
        )
        score = result["originality_score"]
        is_original = result["is_original"]
        matches = result["closest_matches"]
        similarity = int(result.get("derivative_similarity_score", 100))

        if similarity >= 90:
            self.pending_withdrawals[sender] = u256(int(self.pending_withdrawals.get(sender, u256(0))) + int(self.mint_fee))
            MintRejected(sender, "Too similar to parent work — near-duplicate.").emit()
            raise Exception("Mint rejected: this submission is a near-duplicate of its claimed parent.")

        self.token_count = u256(int(self.token_count) + 1)
        token_id = self.token_count

        if similarity >= 30:
            # Legitimate derivative: link lineage and set royalty proportional to similarity.
            royalty_bps = u256(int(similarity) * 100)  # e.g. 60% similarity -> 6000 bps (60%) ceiling below
            if int(royalty_bps) > 5000:
                royalty_bps = u256(5000)  # cap royalty share at 50% of future sale price
            status = "PROBABLE_ORIGINAL" if score >= 40 else "UNVERIFIED"
            new_record = NFT_Record(
                token_id=token_id,
                creator=sender,
                owner=sender,
                title=title,
                description=description,
                media_url=media_url,
                category=parent.category,
                minted_at=u256(0),
                authenticity_score=u8(score),
                authenticity_status=status,
                similar_works_found=json.dumps(matches),
                parent_token_id=parent_token_id,
                is_derivative=u256(1),
                derivative_similarity_score=u8(similarity),
                royalty_bps_to_parent=royalty_bps,
                audit_history=json.dumps([]),
                challenge_history=json.dumps([]),
                last_audited_at=u256(0),
                audit_count=u256(0),
            )
            DerivativeMinted(token_id, parent_token_id, u8(similarity), royalty_bps).emit()
        else:
            # AI judged it independently original despite the "derivative" submission — no royalty link.
            status = "VERIFIED_ORIGINAL" if score >= 85 else "PROBABLE_ORIGINAL"
            new_record = NFT_Record(
                token_id=token_id,
                creator=sender,
                owner=sender,
                title=title,
                description=description,
                media_url=media_url,
                category=parent.category,
                minted_at=u256(0),
                authenticity_score=u8(score),
                authenticity_status=status,
                similar_works_found=json.dumps(matches),
                parent_token_id=u256(0),
                is_derivative=u256(0),
                derivative_similarity_score=u8(similarity),
                royalty_bps_to_parent=u256(0),
                audit_history=json.dumps([]),
                challenge_history=json.dumps([]),
                last_audited_at=u256(0),
                audit_count=u256(0),
            )
            NFTMinted(token_id, sender, status).emit()

        self.nfts[token_id] = new_record
        self.treasury_balance = u256(int(self.treasury_balance) + int(self.mint_fee))
        return token_id

    # -----------------------------------------------------------------
    # Living authenticity: audits and challenges
    # -----------------------------------------------------------------

    @gl.public.write
    def audit_provenance(self, token_id: u256):
        record = self.nfts[token_id]

        if record.authenticity_status == "REVOKED":
            raise Exception("This token's authenticity has already been permanently revoked.")

        result = self._run_originality_check(record.title, record.description, record.media_url)
        fresh_score = result["originality_score"]
        is_original = result["is_original"]
        matches = result["closest_matches"]

        new_score = self._apply_decay(record.authenticity_score, fresh_score)

        history = json.loads(record.audit_history)
        history.append({
            "audit_index": int(record.audit_count) + 1,
            "score_before": int(record.authenticity_score),
            "score_after": int(new_score),
            "findings": matches,
            "triggered_by": str(gl.message.sender_address),
        })
        record.audit_history = json.dumps(history[-25:])  # cap history length
        record.audit_count = u256(int(record.audit_count) + 1)
        record.authenticity_score = new_score

        if (not is_original) and int(new_score) < 20:
            record.authenticity_status = "REVOKED"
            self.nfts[token_id] = record
            AuthenticityRevoked(token_id).emit()
            return

        if int(new_score) < 40:
            record.authenticity_status = "DISPUTED"
            self.nfts[token_id] = record
            AuthenticityDisputed(token_id, new_score).emit()
            return

        self.nfts[token_id] = record
        ProvenanceAudited(token_id, new_score).emit()

    @gl.public.write
    def challenge_authenticity(self, token_id: u256, evidence_url: str, explanation: str):
        record = self.nfts[token_id]
        challenger = gl.message.sender_address

        def evaluate() -> str:
            prompt = (
                f"You are re-examining a minted NFT's authenticity certificate on GenLayer "
                f"following a formal challenge.\\n\\n"
                f"TOKEN RECORD:\\nTitle: {record.title}\\nDescription: {record.description}\\n"
                f"Media reference: {record.media_url}\\n\\n"
                f"CHALLENGE:\\nChallenger evidence URL: {evidence_url}\\n"
                f"Challenger explanation: {explanation}\\n\\n"
                "Decide one of three outcomes: 'UPHELD' (the challenge lacks merit, the token "
                "stays as-is), 'DISPUTED' (the challenge has some merit; flag the token but do "
                "not revoke), or 'REVOKED' (the challenge provides clear, unarguable proof this "
                "work is not original / was stolen). Return JSON only: "
                "{'outcome': '<UPHELD|DISPUTED|REVOKED>', 'reasoning': '<string>'}"
            )
            raw = gl.nondet.exec_prompt(prompt, response_format="json")
            try:
                data = json.loads(raw)
                outcome = str(data.get("outcome", "DISPUTED")).upper()
                if outcome not in ("UPHELD", "DISPUTED", "REVOKED"):
                    outcome = "DISPUTED"
                return json.dumps({"outcome": outcome, "reasoning": str(data.get("reasoning", ""))})
            except Exception:
                return json.dumps({"outcome": "DISPUTED", "reasoning": "Fallback: could not parse model output."})

        principle = (
            "The 'outcome' field must be identical across all validators. Reasoning text may "
            "vary in wording but must support the same outcome."
        )
        consensus_raw = gl.eq_principle.prompt_comparative(evaluate, principle=principle)
        consensus = json.loads(consensus_raw)
        outcome = consensus["outcome"]

        history = json.loads(record.challenge_history)
        history.append({
            "challenger": str(challenger),
            "evidence_url": evidence_url,
            "explanation": explanation,
            "outcome": outcome,
            "reasoning": consensus.get("reasoning", ""),
        })
        record.challenge_history = json.dumps(history[-25:])

        if outcome == "REVOKED":
            record.authenticity_status = "REVOKED"
        elif outcome == "DISPUTED":
            record.authenticity_status = "DISPUTED"
            record.authenticity_score = u8(min(int(record.authenticity_score), 39))

        self.nfts[token_id] = record
        AuthenticityChallenged(token_id, challenger, outcome).emit()
        if outcome == "REVOKED":
            AuthenticityRevoked(token_id).emit()

    # -----------------------------------------------------------------
    # Ownership transfer (no payment)
    # -----------------------------------------------------------------

    @gl.public.write
    def transfer_nft(self, token_id: u256, to: Address):
        record = self.nfts[token_id]
        sender = gl.message.sender_address
        if record.owner != sender:
            raise Exception("Only the current owner can transfer this token.")

        listing = self.listings.get(token_id, None)
        if listing is not None and int(listing.active) == 1:
            listing.active = u256(0)
            self.listings[token_id] = listing

        record.owner = to
        self.nfts[token_id] = record
        NFTTransferred(token_id, sender, to).emit()

    # -----------------------------------------------------------------
    # Marketplace
    # -----------------------------------------------------------------

    @gl.public.write
    def list_for_sale(self, token_id: u256, price: u256):
        record = self.nfts[token_id]
        sender = gl.message.sender_address

        if record.owner != sender:
            raise Exception("Only the current owner can list this token.")
        if record.authenticity_status == "REVOKED":
            raise Exception("Tokens with a revoked authenticity certificate cannot be listed for sale.")
        if int(price) <= 0:
            raise Exception("Price must be positive.")

        self.listings[token_id] = Listing(
            token_id=token_id,
            seller=sender,
            price=price,
            listed_at=u256(0),
            active=u256(1),
        )
        NFTListed(token_id, sender, price).emit()

    @gl.public.write
    def cancel_listing(self, token_id: u256):
        listing = self.listings[token_id]
        sender = gl.message.sender_address
        if listing.seller != sender:
            raise Exception("Only the seller can cancel this listing.")
        listing.active = u256(0)
        self.listings[token_id] = listing
        ListingCancelled(token_id).emit()

    def verify_purchase(self, token_id: u256):
        """
        Inter-contract call simulation: queries the Audit Contract (Contract 2)
        to check the authenticity/originality score at the exact moment of purchase.
        If the score is below the threshold of 40, the transaction is rejected immediately.
        """
        # In a multi-contract architecture, this would be:
        # audit_contract = gl.get_contract_at(self.audit_contract_address)
        # score = audit_contract.get_score(token_id)
        #
        # For this unified demonstration ledger, we read from storage:
        record = self.nfts[token_id]
        score = int(record.authenticity_score)
        
        if score < 40:
            raise Exception("Cannot buy: Originality score too low! Under threshold of 40.")

    @gl.public.write.payable
    def buy_nft(self, token_id: u256):
        listing = self.listings[token_id]
        buyer = gl.message.sender_address
        sent_value = gl.message.value

        if int(listing.active) != 1:
            raise Exception("This listing is not active.")
        if sent_value < listing.price:
            raise Exception("Insufficient payment for this listing.")

        # Real-time inter-contract check: queries Contract 2 (Audit)
        self.verify_purchase(token_id)

        record = self.nfts[token_id]
        if record.authenticity_status == "REVOKED":
            raise Exception("Tokens with a revoked authenticity certificate cannot be sold.")

        overpay = u256(int(sent_value) - int(listing.price))
        if int(overpay) > 0:
            self.pending_withdrawals[buyer] = u256(int(self.pending_withdrawals.get(buyer, u256(0))) + int(overpay))

        price = int(listing.price)
        fee = (price * int(self.marketplace_fee_bps)) // 10000
        royalty = 0
        if int(record.is_derivative) == 1 and int(record.royalty_bps_to_parent) > 0:
            parent = self.nfts[record.parent_token_id]
            royalty = (price * int(record.royalty_bps_to_parent)) // 10000
            self.pending_withdrawals[parent.creator] = u256(
                int(self.pending_withdrawals.get(parent.creator, u256(0))) + royalty
            )

        seller_proceeds = price - fee - royalty
        seller = listing.seller
        self.pending_withdrawals[seller] = u256(int(self.pending_withdrawals.get(seller, u256(0))) + seller_proceeds)
        self.treasury_balance = u256(int(self.treasury_balance) + fee)

        listing.active = u256(0)
        self.listings[token_id] = listing

        record.owner = buyer
        self.nfts[token_id] = record

        NFTSold(token_id, buyer, seller, u256(price), u256(fee), u256(royalty)).emit()

    @gl.public.write
    def claim_proceeds(self) -> u256:
        sender = gl.message.sender_address
        amount = self.pending_withdrawals.get(sender, u256(0))
        if int(amount) <= 0:
            raise Exception("Nothing to claim.")
        self.pending_withdrawals[sender] = u256(0)
        gl.get_contract_at(sender).emit_transfer(value=amount)
        return amount

    # -----------------------------------------------------------------
    # Read methods
    # -----------------------------------------------------------------

    @gl.public.view
    def get_nft_details(self, token_id: u256) -> NFT_Record:
        return self.nfts[token_id]

    @gl.public.view
    def get_lineage(self, token_id: u256) -> list:
        chain = []
        current = self.nfts[token_id]
        chain.append(int(current.token_id))
        guard = 0
        while int(current.is_derivative) == 1 and guard < 50:
            current = self.nfts[current.parent_token_id]
            chain.append(int(current.token_id))
            guard += 1
        return chain

    @gl.public.view
    def get_audit_history(self, token_id: u256) -> str:
        return self.nfts[token_id].audit_history

    @gl.public.view
    def get_challenge_history(self, token_id: u256) -> str:
        return self.nfts[token_id].challenge_history

    @gl.public.view
    def list_tokens_by_status(self, status: str) -> list:
        result = []
        total = int(self.token_count)
        for i in range(1, total + 1):
            tid = u256(i)
            rec = self.nfts.get(tid, None)
            if rec is not None and rec.authenticity_status == status:
                result.append(i)
        return result

    @gl.public.view
    def list_tokens_by_creator(self, creator: Address) -> list:
        result = []
        total = int(self.token_count)
        for i in range(1, total + 1):
            tid = u256(i)
            rec = self.nfts.get(tid, None)
            if rec is not None and rec.creator == creator:
                result.append(i)
        return result

    @gl.public.view
    def get_active_listings(self) -> list:
        result = []
        total = int(self.token_count)
        for i in range(1, total + 1):
            tid = u256(i)
            listing = self.listings.get(tid, None)
            if listing is not None and int(listing.active) == 1:
                result.append(i)
        return result

    @gl.public.view
    def get_listing(self, token_id: u256) -> Listing:
        return self.listings[token_id]

    @gl.public.view
    def get_pending_balance(self, address: Address) -> u256:
        return self.pending_withdrawals.get(address, u256(0))
`;
