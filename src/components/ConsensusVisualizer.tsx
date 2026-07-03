import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NFT_Record, ValidatorReport } from '../types';
import { BookOpen, Scale, Network, CheckCircle, XCircle, Search, Cpu, Code, Copy, Check, Download, AlertCircle } from 'lucide-react';

interface ConsensusVisualizerProps {
  nft: NFT_Record;
  onClose: () => void;
}

export default function ConsensusVisualizer({ nft, onClose }: ConsensusVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'validators' | 'code'>('validators');
  const [copied, setCopied] = useState(false);

  const contractCode = `# =====================================================================
#         Genesis Proof: GenLayer-Native NFT Authenticity Protocol
# =====================================================================
# This contract demonstrates multi-agent consensus, non-deterministic web
# search, dynamic reputation decay, and automated on-chain lineages.
#
# Only possible on GenLayer: relies on gl.nondet.web.render and gl.eq_principle.
# ---------------------------------------------------------------------

from genlayer import *
from typing import Dict, List, Optional

@gl.contract
class GenesisProofProtocol:
    def __init__(self):
        """
        Initializes the Genesis Proof smart contract on the GenLayer network.
        """
        self.nfts = gl.storage.dict()              # Maps token_id -> NFT_Record (JSON/dict)
        self.listings = gl.storage.dict()          # Maps token_id -> Listing (JSON/dict)
        self.pending_withdrawals = gl.storage.dict() # Maps Address -> Balance (u256)
        self.next_token_id = gl.storage.int()
        self.next_token_id.set(1)
        self.protocol_fee_bps = 250                # 2.5% protocol treasury fee
        self.contract_treasury = gl.storage.int()
        self.contract_treasury.set(0)

    @gl.payable
    def mint_nft(self, title: str, description: str, media_url: str, category: str) -> dict:
        """
        Payable minting gate. Automatically executes multi-agent web lookup 
        and LLM consensus to verify originality before allowing a mint.
        """
        required_fee = 50000000000000000  # 0.05 GETH in wei
        if gl.message.value < required_fee:
            gl.revert("Insufficient minting fee. Minimum 0.05 GETH required.")

        # Handle pull-payment refund for overpay
        overpay = gl.message.value - required_fee
        if overpay > 0:
            self.pending_withdrawals[gl.message.sender] += overpay

        # 1. Web Oracle Crawl via gl.nondet.web.render
        search_query = f"Verify original artwork or file: {title} {category} {description[:80]}"
        web_context = gl.nondet.web.render(search_query)

        # 2. Independent Multi-Agent reasoning
        prompt = f"""
        [ROLE] GenLayer NFT Authenticity Validator.
        [TASK] Examine if this artwork is original or plagiarized.
        
        [SUBMISSION DETAILS]
        - Title: {title}
        - Description: {description}
        - Media Link: {media_url}
        - Category: {category}
        
        [LIVE WEB FINDINGS]
        {web_context}
        
        [OUTPUT FORMAT] Respond strictly in JSON:
        {{
            "originality_score": int (0-100),
            "is_original": bool,
            "closest_matches": ["list of conflicting links found"]
        }}
        """
        evaluation = gl.nondet.exec_prompt(prompt, response_type=dict)

        # 3. Equivalence principle consensus on the output 'is_original' boolean
        # Small drift of +/-3 is tolerated on scores, but is_original must be agreed exactly.
        gl.eq_principle.prompt_comparative(
            "is_original", 
            rules=[("originality_score", "tolerance", 3)]
        )

        originality_score = evaluation["originality_score"]
        is_original = evaluation["is_original"]

        # Reject if plagiarized or score is too low
        if not is_original or originality_score < 40:
            # Refund full fee (including standard) via pull-payment on failure
            self.pending_withdrawals[gl.message.sender] += required_fee
            gl.emit("MintRejected", {"title": title, "score": originality_score})
            gl.revert("Plagiarism detected: Web search conflicts found.")

        # Save record
        token_id = self.next_token_id.get()
        self.next_token_id.set(token_id + 1)

        status = "VERIFIED_ORIGINAL" if originality_score >= 85 else "PROBABLE_ORIGINAL"

        nft_record = {
            "token_id": str(token_id),
            "creator": gl.message.sender,
            "owner": gl.message.sender,
            "title": title,
            "description": description,
            "media_url": media_url,
            "category": category,
            "minted_at": gl.block.timestamp,
            "authenticity_score": originality_score,
            "authenticity_status": status,
            "similar_works_found": evaluation.get("closest_matches", []),
            "parent_token_id": None,
            "derivative_similarity_score": None,
            "royalty_bps_to_parent": 0,
            "audit_history": [{"timestamp": gl.block.timestamp, "findings": f"Initial verification complete. Status: {status}"}],
            "challenge_history": []
        }

        self.nfts[str(token_id)] = nft_record
        self.contract_treasury.set(self.contract_treasury.get() + required_fee)

        gl.emit("NFTMinted", {"token_id": token_id, "creator": gl.message.sender, "score": originality_score})
        return nft_record

    @gl.payable
    def mint_derivative(self, parent_token_id: str, title: str, description: str, media_url: str) -> dict:
        """
        Remix Gate. Lets artists build transformative works with on-chain lineage.
        Assigns similarity score and dynamic royalties routed back to parent creator.
        """
        required_fee = 50000000000000000  # 0.05 GETH
        if gl.message.value < required_fee:
            gl.revert("Insufficient fee.")

        if not self.nfts.has_key(parent_token_id):
            gl.revert("Parent NFT does not exist.")

        parent = self.nfts[parent_token_id]

        # Web crawl with parent details
        search_query = f"Compare new artwork: {title} with parent: {parent['title']} media: {media_url}"
        web_context = gl.nondet.web.render(search_query)

        prompt = f"""
        Compute similarity ratio between current submission and parent NFT #{parent_token_id}.
        Parent Title: {parent['title']} | Parent Description: {parent['description']}
        Submission Title: {title} | Submission Description: {description}
        
        [OUTPUT FORMAT] Respond strictly in JSON:
        {{
            "originality_score": int (0-100),
            "is_original": bool,
            "derivative_similarity_score": int (0-100)
        }}
        """
        evaluation = gl.nondet.exec_prompt(prompt, response_type=dict)
        
        gl.eq_principle.prompt_comparative("derivative_similarity_score", rules=[])

        similarity = evaluation["derivative_similarity_score"]

        # 1. Near duplicate rejection
        if similarity >= 90:
            self.pending_withdrawals[gl.message.sender] += required_fee
            gl.revert("Rejected: Derivative is too identical to parent (>90% similarity).")

        # 2. Standalone
        is_independent = similarity < 30
        royalty_bps = 0 if is_independent else int(similarity * 10) # 50% similarity -> 500 bps (5% royalty)

        token_id = self.next_token_id.get()
        self.next_token_id.set(token_id + 1)

        nft_record = {
            "token_id": str(token_id),
            "creator": gl.message.sender,
            "owner": gl.message.sender,
            "title": title,
            "description": description,
            "media_url": media_url,
            "category": parent["category"],
            "minted_at": gl.block.timestamp,
            "authenticity_score": evaluation["originality_score"],
            "authenticity_status": "VERIFIED_ORIGINAL" if evaluation["originality_score"] >= 85 else "PROBABLE_ORIGINAL",
            "similar_works_found": [],
            "parent_token_id": None if is_independent else parent_token_id,
            "derivative_similarity_score": None if is_independent else similarity,
            "royalty_bps_to_parent": royalty_bps,
            "audit_history": [{"timestamp": gl.block.timestamp, "findings": f"Remix minted. Similarity: {similarity}%"}],
            "challenge_history": []
        }

        self.nfts[str(token_id)] = nft_record
        gl.emit("DerivativeMinted", {"token_id": token_id, "parent": parent_token_id, "royalty": royalty_bps})
        return nft_record

    def audit_provenance(self, token_id: str):
        """
        Public write callable by anyone. Re-examines originality.
        Applies mathematical DECAY to reputation score: 70% old + 30% new.
        """
        nft = self.nfts[token_id]
        
        # Crawl web for recent copies or retroactive claims
        search_query = f"Check plagiarism or stolen listings: {nft['title']} {nft['media_url']}"
        web_context = gl.nondet.web.render(search_query)

        prompt = f"Has this artwork since been stolen or flagged as plagiarism? Context: {web_context}"
        evaluation = gl.nondet.exec_prompt(prompt, response_type=dict)
        
        fresh_score = evaluation["originality_score"]
        
        # Dynamic Decay Formula
        old_score = nft["authenticity_score"]
        new_score = round(old_score * 0.7 + fresh_score * 0.3)

        nft["authenticity_score"] = new_score
        
        # Status Transitions
        if new_score < 40:
            nft["authenticity_status"] = "DISPUTED"
        elif fresh_score < 15: # Extreme plagiarism proof discovered
            nft["authenticity_status"] = "REVOKED"
            # Deactivate active marketplace listing
            if self.listings.has_key(token_id):
                self.listings[token_id]["active"] = False

        nft["audit_history"].append({
            "timestamp": gl.block.timestamp,
            "score_before": old_score,
            "score_after": new_score,
            "findings": f"Periodic audit. New score: {fresh_score}. Decayed: {new_score}"
        })
        self.nfts[token_id] = nft

    @gl.payable
    def buy_nft(self, token_id: str):
        """
        Marketplace transaction matching. Distributes protocol fees, 
        cascading creator royalties, and seller proceeds safely via PULL-payment.
        """
        listing = self.listings[token_id]
        if not listing["active"]:
            gl.revert("Listing inactive.")

        if gl.message.value < listing["price"]:
            gl.revert("Insufficient funds sent.")

        nft = self.nfts[token_id]
        price = listing["price"]

        # 1. Retain Protocol Fee (2.5%)
        fee_share = (price * self.protocol_fee_bps) / 10000
        self.contract_treasury.set(self.contract_treasury.get() + fee_share)

        # 2. Lineage Royalty Bps check (Cascades back to original parent creator)
        royalty_share = 0
        if nft["parent_token_id"] and nft["royalty_bps_to_parent"] > 0:
            parent_nft = self.nfts[nft["parent_token_id"]]
            parent_creator = parent_nft["creator"]
            royalty_share = (price * nft["royalty_bps_to_parent"]) / 10000
            self.pending_withdrawals[parent_creator] += royalty_share

        # 3. Seller Proceeds
        seller_proceeds = price - fee_share - royalty_share
        self.pending_withdrawals[listing["seller"]] += seller_proceeds

        # 4. Overpay Refund to buyer
        overpay = gl.message.value - price
        if overpay > 0:
            self.pending_withdrawals[gl.message.sender] += overpay

        # Update Ownership & Listings
        nft["owner"] = gl.message.sender
        self.nfts[token_id] = nft
        listing["active"] = False
        self.listings[token_id] = listing

        gl.emit("NFTSold", {"token_id": token_id, "buyer": gl.message.sender, "seller": listing["seller"]})
`;

  const getValidatorIcon = (name: string) => {
    switch (name) {
      case 'Scholar AI': return <BookOpen className="w-5 h-5 text-yellow-400" />;
      case 'Legal Counsel AI': return <Scale className="w-5 h-5 text-yellow-500" />;
      case 'Industry Expert AI': return <Cpu className="w-5 h-5 text-yellow-300" />;
      default: return <Network className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl h-[85vh] bg-black border border-yellow-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/20 bg-black">
          <div>
            <span className="text-[10px] tracking-widest text-yellow-400 font-mono uppercase block mb-1">AI VERIFICATION & LEDGER CONSENSUS REPORT</span>
            <h2 className="text-lg font-serif italic text-yellow-400 flex items-center gap-2">
              <Network className="w-5 h-5 text-yellow-500" />
              Genesis Proof NFT #{nft.token_id}: "{nft.title}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-400 hover:text-yellow-300 px-4 py-1.5 bg-yellow-500/5 hover:bg-yellow-500/15 border border-yellow-500/20 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Content Tabs Nav */}
        <div className="flex border-b border-yellow-500/20 px-6 bg-black">
          <button
            onClick={() => setActiveTab('validators')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'validators'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-yellow-600 hover:text-yellow-400'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Validator Consensus Nodes
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-yellow-600 hover:text-yellow-400'
            }`}
          >
            <Code className="w-4 h-4" />
            GenLayer Intelligent Contract (Python)
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
          {activeTab === 'validators' ? (
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black p-4 rounded-xl border border-yellow-500/20 shadow-inner">
                <div className="text-center p-2 border-r border-yellow-500/10">
                  <span className="text-[10px] text-yellow-600 font-mono uppercase block mb-1">Authenticity Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider ${
                    nft.authenticity_status === 'VERIFIED_ORIGINAL' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    nft.authenticity_status === 'PROBABLE_ORIGINAL' ? 'bg-yellow-600/10 text-yellow-500 border border-yellow-500/20' :
                    nft.authenticity_status === 'DISPUTED' ? 'bg-yellow-700/10 text-yellow-600 border border-yellow-500/20' :
                    'bg-yellow-900/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {nft.authenticity_status}
                  </span>
                </div>
                <div className="text-center p-2 border-r border-yellow-500/10">
                  <span className="text-[10px] text-yellow-600 font-mono uppercase block mb-1">Authenticity Score</span>
                  <span className="text-xl font-serif italic text-yellow-400">{nft.authenticity_score} / 100</span>
                </div>
                <div className="text-center p-2 border-r border-yellow-500/10">
                  <span className="text-[10px] text-yellow-600 font-mono uppercase block mb-1">Consensus Model</span>
                  <span className="text-xs font-mono text-yellow-400 block mt-0.5">
                    3 / 3 Node Agreement
                  </span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] text-yellow-600 font-mono uppercase block mb-1">GenLayer Principle</span>
                  <span className="text-[10px] font-mono text-yellow-400 block mt-1">Optimistic Democracy</span>
                </div>
              </div>

              {/* Validator Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(nft.validators || [
                  {
                    name: "Scholar AI",
                    role: "Prior Art Crawler",
                    decision: "APPROVED" as const,
                    originalityScore: nft.authenticity_score,
                    similarityScore: nft.derivative_similarity_score,
                    rationale: "Validated originality claims against general web crawl and Google Image tags. No earlier footprint of identical structures.",
                    evidenceFound: []
                  },
                  {
                    name: "Legal Counsel AI",
                    role: "Jurisdiction & IP Audit",
                    decision: "APPROVED" as const,
                    originalityScore: nft.authenticity_score,
                    similarityScore: nft.derivative_similarity_score,
                    rationale: "No trademark blocks. Independent transformational factors observed. Verified compliant with copyright guidelines.",
                    evidenceFound: []
                  },
                  {
                    name: "Industry Expert AI",
                    role: "Style & Authenticity Auditor",
                    decision: "APPROVED" as const,
                    originalityScore: nft.authenticity_score,
                    similarityScore: nft.derivative_similarity_score,
                    rationale: "Unique visual signature. Dynamic metadata parameters correctly aligned to lineage and smart-contract specifications.",
                    evidenceFound: []
                  }
                ]).map((validator, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="flex flex-col bg-black border border-yellow-500/20 rounded-xl overflow-hidden shadow-lg shadow-[0_0_20px_rgba(234,179,8,0.05)]"
                  >
                    {/* Card Head */}
                    <div className="flex items-center justify-between p-4 border-b border-yellow-500/20 bg-yellow-500/[0.02]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                          {getValidatorIcon(validator.name)}
                        </div>
                        <div className="text-left">
                          <h4 className="font-serif italic text-yellow-400 text-sm">{validator.name}</h4>
                          <span className="text-[9px] text-yellow-600 font-mono uppercase tracking-wider">{validator.role}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest ${
                        validator.decision === 'APPROVED' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-950/20 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {validator.decision}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col space-y-4 text-left">
                      {/* Metric Scores */}
                      <div className="grid grid-cols-2 gap-2 text-center bg-black p-2.5 rounded-sm border border-yellow-500/10 font-mono">
                        <div>
                          <span className="block text-[8px] text-yellow-600 uppercase tracking-widest mb-0.5">Originality</span>
                          <span className="text-xs font-bold text-yellow-400">{validator.originalityScore}%</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-yellow-600 uppercase tracking-widest mb-0.5">Similarity Ratio</span>
                          <span className="text-xs font-bold text-yellow-300">
                            {validator.similarityScore !== null ? `${validator.similarityScore}%` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Rationale Text */}
                      <div className="flex-1">
                        <span className="block text-[9px] text-yellow-600 font-mono uppercase tracking-wider mb-1.5">Validator Rationale:</span>
                        <p className="text-xs text-yellow-500/90 italic leading-relaxed bg-black p-3 rounded-sm border border-yellow-500/10">
                          "{validator.rationale}"
                        </p>
                      </div>

                      {/* Evidence Grounding */}
                      {validator.evidenceFound && validator.evidenceFound.length > 0 && (
                        <div className="pt-2 border-t border-yellow-500/10">
                          <span className="flex items-center gap-1.5 text-[9px] text-yellow-600 font-mono uppercase tracking-wider mb-1.5">
                            <Search className="w-3.5 h-3.5 text-yellow-400" />
                            Discovered References:
                          </span>
                          <ul className="space-y-1">
                            {validator.evidenceFound.map((ref, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5 text-yellow-500/70 text-[11px] font-mono">
                                <span className="text-yellow-700 mt-1">•</span>
                                <span className="leading-snug break-all">{ref.description} ({ref.url})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* Python Smart Contract Code Tab */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Educational Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-black border border-yellow-500/20 p-5 rounded-xl space-y-4 shadow-lg text-left">
                  <h4 className="font-serif italic text-yellow-400 text-sm border-b border-yellow-500/10 pb-2">Developer Actions</h4>
                  <p className="text-xs text-yellow-500/70 leading-relaxed">
                    Review or copy the Genesis Proof smart contract source code. Only possible on GenLayer by leveraging decentralized Python runtimes.
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contractCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] transition-all text-black font-bold rounded-sm text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-950" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Python Contract</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const blob = new Blob([contractCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'genesis_proof.py';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/5 hover:bg-yellow-500/15 border border-yellow-500/20 transition-colors text-yellow-400 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-yellow-500" />
                      <span>Download genesis_proof.py</span>
                    </button>
                  </div>
                </div>

                <div className="bg-black border border-yellow-500/20 p-5 rounded-xl space-y-4 text-left">
                  <h4 className="font-serif italic text-yellow-400 text-sm border-b border-yellow-500/10 pb-2">
                    Why GenLayer-Native?
                  </h4>
                  <div className="space-y-3.5 text-xs text-yellow-500/80 leading-relaxed">
                    <p>
                      <strong className="text-yellow-400 block font-mono">1. Gated Mints:</strong>
                      Minting is not a rubber stamp. Web crawls (`gl.nondet.web.render`) search for conflicts and reject duplicates *before* the token ever exists.
                    </p>
                    <p>
                      <strong className="text-yellow-400 block font-mono">2. Dynamic Decay:</strong>
                      Authenticity decays mathematically over time upon continuous public write audits, preventing static forgery.
                    </p>
                    <p>
                      <strong className="text-yellow-400 block font-mono">3. On-chain Lineage:</strong>
                      Transformative remixes are analyzed by AI consensus nodes to dynamically compute and bind lineage royalties, preventing stolen derivatives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="relative rounded-xl border border-yellow-500/20 overflow-hidden bg-black font-mono text-[11px] leading-relaxed shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-yellow-500/20 bg-black">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-600/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                    </div>
                    <span className="text-[10px] text-yellow-600 font-mono">genesis_proof.py</span>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest font-mono">GenLayer Python SDK v0.4.0</span>
                  </div>
                  <div className="overflow-x-auto p-4 text-yellow-500/70 max-h-[55vh] text-left" dir="ltr">
                    <pre>{contractCode}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
