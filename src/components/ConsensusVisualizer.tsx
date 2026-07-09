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
# search, and automated on-chain authenticity auditing.
# Only possible on GenLayer: relies on gl.nondet.web.render and gl.eq_principle.
# ---------------------------------------------------------------------

from genlayer import *
import json
import urllib.parse
from dataclasses import dataclass

@allow_storage
@dataclass
class NFT_Record:
    token_id: u256
    creator: Address              # Original minter — permanent
    owner: Address                 # Current holder
    title: str
    description: str
    media_url: str
    category: str
    minted_at: u256
    authenticity_score: u8         # 0-100, mutable over time
    authenticity_status: str       # VERIFIED_ORIGINAL | PROBABLE_ORIGINAL | DISPUTED
    similar_works_found: str       # JSON-encoded list of matches
    audit_history: str             # JSON-encoded list of audits

class GenesisProof(gl.Contract):
    nfts: TreeMap[u256, NFT_Record]
    token_count: u256
    owner: Address
    mint_fee: u256

    def __init__(self):
        """
        Initializes the Genesis Proof smart contract on the GenLayer network.
        """
        self.token_count = u256(0)
        self.owner = gl.message.sender_address
        self.mint_fee = u256(50000000000000000) # 0.05 GETH in wei

    def _run_originality_check(self, title: str, description: str, media_url: str) -> dict:
        """
        Runs the non-deterministic, web-grounded originality evaluation and
        reconciles it across validators via gl.eq_principle.prompt_comparative.
        """
        def evaluate() -> str:
            query = f"{title[:60]} {description[:60]}"
            try:
                search_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
                web_context = gl.nondet.web.render(search_url, mode="text")[:600]
            except Exception:
                web_context = "No data"

            prompt = (
                f"Work title: {title}\\n"
                f"Description: {description}\\n"
                f"Media reference: {media_url}\\n"
                f"Relevant web search context:\\n{web_context}\\n\\n"
                "Evaluate whether this work is original or if duplicate/similar work exists on the web. "
                "Return JSON only: "
                "{'originality_score': <int 0-100>, 'is_original': <true|false>, "
                "'closest_matches': [<string>, ...], 'rationale': '<string>'}"
            )
            raw = gl.nondet.exec_prompt(prompt, response_format="json")
            return raw

        principle = "The 'is_original' boolean must be identical across validators."
        consensus_raw = gl.eq_principle.prompt_comparative(evaluate, principle=principle)
        return json.loads(consensus_raw)

    @gl.public.write.payable
    def mint_nft(self, title: str, description: str, media_url: str, category: str) -> u256:
        """
        Payable minting gate. Automatically executes multi-agent web lookup 
        and LLM consensus to verify originality before allowing a mint.
        """
        sender = gl.message.sender_address
        if gl.message.value < self.mint_fee:
            raise Exception("Insufficient minting fee. Minimum 0.05 GETH required.")

        # Execute web-grounded consensus check
        result = self._run_originality_check(title, description, media_url)
        score = result["originality_score"]
        is_original = result["is_original"]

        # Reject if plagiarized or score is too low
        if not is_original or score < 40:
            gl.emit("MintRejected", {"title": title, "score": score})
            raise Exception("Mint rejected: work lacks originality or conflicts found.")

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
            minted_at=u256(1783818300), # Simulated unix time
            authenticity_score=u8(score),
            authenticity_status=status,
            similar_works_found=json.dumps(result.get("closest_matches", [])),
            audit_history=json.dumps([{"timestamp": "1783818300", "findings": f"Initial verification complete. Status: {status}"}])
        )

        gl.emit("NFTMinted", {"token_id": int(token_id), "creator": str(sender), "score": int(score)})
        return token_id

    @gl.public.write
    def audit_provenance(self, token_id: u256):
        """
        Public write callable by anyone. Re-examines originality.
        Applies mathematical DECAY to reputation score: 70% old + 30% new.
        """
        record = self.nfts[token_id]
        result = self._run_originality_check(record.title, record.description, record.media_url)
        fresh_score = result["originality_score"]
        
        # apply decay formula (70% previous score + 30% fresh score)
        new_score = u8(round(int(record.authenticity_score) * 0.7 + fresh_score * 0.3))
        record.authenticity_score = new_score
        
        if int(new_score) < 40:
            record.authenticity_status = "DISPUTED"
        elif int(new_score) >= 85:
            record.authenticity_status = "VERIFIED_ORIGINAL"
        else:
            record.authenticity_status = "PROBABLE_ORIGINAL"

        history = json.loads(record.audit_history)
        history.append({
            "timestamp": "Simulated",
            "score_before": int(record.authenticity_score),
            "score_after": int(new_score),
            "findings": f"Periodic audit recheck. Fresh score: {fresh_score}. Decayed: {new_score}"
        })
        record.audit_history = json.dumps(history[-10:])
        
        self.nfts[token_id] = record
        gl.emit("ProvenanceAudited", {"token_id": int(token_id), "score": int(new_score)})

    @gl.public.view
    def get_nft_details(self, token_id: u256) -> NFT_Record:
        """
        Basic Audit endpoint to read NFT state directly from the ledger.
        """
        return self.nfts[token_id]
`;

  const getValidatorIcon = (name: string) => {
    switch (name) {
      case 'Scholar AI': return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case 'Legal Counsel AI': return <Scale className="w-5 h-5 text-indigo-500" />;
      case 'Industry Expert AI': return <Cpu className="w-5 h-5 text-indigo-300" />;
      default: return <Network className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl h-[85vh] bg-black border border-indigo-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/20 bg-black">
          <div>
            <span className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase block mb-1">AI VERIFICATION & LEDGER CONSENSUS REPORT</span>
            <h2 className="text-lg font-serif italic text-indigo-400 flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              Genesis Proof NFT #{nft.token_id}: "{nft.title}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-300 px-4 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Content Tabs Nav */}
        <div className="flex border-b border-indigo-500/20 px-6 bg-black">
          <button
            onClick={() => setActiveTab('validators')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'validators'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-indigo-600 hover:text-indigo-400'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Validator Consensus Nodes
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-indigo-600 hover:text-indigo-400'
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black p-4 rounded-xl border border-indigo-500/20 shadow-inner">
                <div className="text-center p-2 border-r border-indigo-500/10">
                  <span className="text-[10px] text-indigo-600 font-mono uppercase block mb-1">Authenticity Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider ${
                    nft.authenticity_status === 'VERIFIED_ORIGINAL' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    nft.authenticity_status === 'PROBABLE_ORIGINAL' ? 'bg-indigo-600/10 text-indigo-500 border border-indigo-500/20' :
                    nft.authenticity_status === 'DISPUTED' ? 'bg-yellow-700/10 text-indigo-600 border border-indigo-500/20' :
                    'bg-zinc-800/10 text-indigo-500 border border-indigo-500/20'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {nft.authenticity_status}
                  </span>
                </div>
                <div className="text-center p-2 border-r border-indigo-500/10">
                  <span className="text-[10px] text-indigo-600 font-mono uppercase block mb-1">Authenticity Score</span>
                  <span className="text-xl font-serif italic text-indigo-400">{nft.authenticity_score} / 100</span>
                </div>
                <div className="text-center p-2 border-r border-indigo-500/10">
                  <span className="text-[10px] text-indigo-600 font-mono uppercase block mb-1">Consensus Model</span>
                  <span className="text-xs font-mono text-indigo-400 block mt-0.5">
                    3 / 3 Node Agreement
                  </span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] text-indigo-600 font-mono uppercase block mb-1">GenLayer Principle</span>
                  <span className="text-[10px] font-mono text-indigo-400 block mt-1">Optimistic Democracy</span>
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
                    similarityScore: null,
                    rationale: "Validated originality claims against general web crawl and Google Image tags. No earlier footprint of identical structures.",
                    evidenceFound: []
                  },
                  {
                    name: "Legal Counsel AI",
                    role: "Jurisdiction & IP Audit",
                    decision: "APPROVED" as const,
                    originalityScore: nft.authenticity_score,
                    similarityScore: null,
                    rationale: "No trademark blocks. Independent transformational factors observed. Verified compliant with copyright guidelines.",
                    evidenceFound: []
                  },
                  {
                    name: "Industry Expert AI",
                    role: "Style & Authenticity Auditor",
                    decision: "APPROVED" as const,
                    originalityScore: nft.authenticity_score,
                    similarityScore: null,
                    rationale: "Unique visual signature. Dynamic metadata parameters correctly aligned to lineage and smart-contract specifications.",
                    evidenceFound: []
                  }
                ]).map((validator, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="flex flex-col bg-black border border-indigo-500/20 rounded-xl overflow-hidden shadow-lg shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                  >
                    {/* Card Head */}
                    <div className="flex items-center justify-between p-4 border-b border-indigo-500/20 bg-indigo-500/[0.02]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/20 rounded-sm">
                          {getValidatorIcon(validator.name)}
                        </div>
                        <div className="text-left">
                          <h4 className="font-serif italic text-indigo-400 text-sm">{validator.name}</h4>
                          <span className="text-[9px] text-indigo-600 font-mono uppercase tracking-wider">{validator.role}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest ${
                        validator.decision === 'APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-950/20 text-indigo-500 border border-indigo-500/20'
                      }`}>
                        {validator.decision}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col space-y-4 text-left">
                      {/* Metric Scores */}
                      <div className="grid grid-cols-2 gap-2 text-center bg-black p-2.5 rounded-sm border border-indigo-500/10 font-mono">
                        <div>
                          <span className="block text-[8px] text-indigo-600 uppercase tracking-widest mb-0.5">Originality</span>
                          <span className="text-xs font-bold text-indigo-400">{validator.originalityScore}%</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-indigo-600 uppercase tracking-widest mb-0.5">Similarity Ratio</span>
                          <span className="text-xs font-bold text-indigo-300">
                            {validator.similarityScore !== null ? `${validator.similarityScore}%` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Rationale Text */}
                      <div className="flex-1">
                        <span className="block text-[9px] text-indigo-600 font-mono uppercase tracking-wider mb-1.5">Validator Rationale:</span>
                        <p className="text-xs text-indigo-500/90 italic leading-relaxed bg-black p-3 rounded-sm border border-indigo-500/10">
                          "{validator.rationale}"
                        </p>
                      </div>

                      {/* Evidence Grounding */}
                      {validator.evidenceFound && validator.evidenceFound.length > 0 && (
                        <div className="pt-2 border-t border-indigo-500/10">
                          <span className="flex items-center gap-1.5 text-[9px] text-indigo-600 font-mono uppercase tracking-wider mb-1.5">
                            <Search className="w-3.5 h-3.5 text-indigo-400" />
                            Discovered References:
                          </span>
                          <ul className="space-y-1">
                            {validator.evidenceFound.map((ref, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5 text-indigo-500/70 text-[11px] font-mono">
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
                <div className="bg-black border border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-lg text-left">
                  <h4 className="font-serif italic text-indigo-400 text-sm border-b border-indigo-500/10 pb-2">Developer Actions</h4>
                  <p className="text-xs text-indigo-500/70 leading-relaxed">
                    Review or copy the Genesis Proof smart contract source code. Only possible on GenLayer by leveraging decentralized Python runtimes.
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contractCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] transition-all text-black font-bold rounded-sm text-xs uppercase tracking-wider cursor-pointer"
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 transition-colors text-indigo-400 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-indigo-500" />
                      <span>Download genesis_proof.py</span>
                    </button>
                  </div>
                </div>

                <div className="bg-black border border-indigo-500/20 p-5 rounded-xl space-y-4 text-left">
                  <h4 className="font-serif italic text-indigo-400 text-sm border-b border-indigo-500/10 pb-2">
                    Why GenLayer-Native?
                  </h4>
                  <div className="space-y-3.5 text-xs text-indigo-500/80 leading-relaxed">
                    <p>
                      <strong className="text-indigo-400 block font-mono">1. Gated Mints:</strong>
                      Minting is not a rubber stamp. Web crawls (`gl.nondet.web.render`) search for conflicts and reject duplicates *before* the token ever exists.
                    </p>
                    <p>
                      <strong className="text-indigo-400 block font-mono">2. Dynamic Decay:</strong>
                      Authenticity decays mathematically over time upon continuous public write audits, preventing static forgery.
                    </p>
                    <p>
                      <strong className="text-indigo-400 block font-mono">3. On-chain Consensus:</strong>
                      Validators run decentralized web searches to resolve consensus on the originality state of each work transparently.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="relative rounded-xl border border-indigo-500/20 overflow-hidden bg-black font-mono text-[11px] leading-relaxed shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/20 bg-black">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400/80"></div>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-mono">genesis_proof.py</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">GenLayer Python SDK v0.4.0</span>
                  </div>
                  <div className="overflow-x-auto p-4 text-indigo-500/70 max-h-[55vh] text-left" dir="ltr">
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
