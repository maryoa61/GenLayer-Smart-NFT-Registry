import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PatentNFT, ValidatorReport } from '../types';
import { ShieldAlert, BookOpen, Scale, Network, CheckCircle, XCircle, Search, Cpu, Code, ArrowRight, ExternalLink, Copy, Check, Download, AlertCircle, FileText } from 'lucide-react';

interface ConsensusVisualizerProps {
  patent: PatentNFT;
  onClose: () => void;
}

export default function ConsensusVisualizer({ patent, onClose }: ConsensusVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'validators' | 'code'>('validators');
  const [copied, setCopied] = useState(false);

  const contractCode = `# =====================================================================
#             GenLayer Intelligent Patent NFT (IP-NFT) Contract
# =====================================================================
# This contract demonstrates robust multi-agent consensus, non-deterministic
# web search oracles, and dynamic metadata evolution in GenLayer.
# It is designed as an educational, reusable blueprint for builders.
# ---------------------------------------------------------------------

from genlayer import *
from typing import Dict, List, Optional

@gl.contract
class IntelligentPatentNFT:
    def __init__(self):
        """
        Initializes the state of the Intelligent Patent Registry on GenLayer.
        Using gl.storage guarantees decentralized persistence across nodes.
        """
        self.patents = gl.storage.dict()       # Maps NFT_ID -> Patent Data Dict
        self.challenges = gl.storage.dict()    # Maps NFT_ID -> List of Prior Art Claims
        self.patent_counter = gl.storage.int()  # Keeps track of registered patents
        self.patent_counter.set(1)

    @gl.public
    def evaluate_and_mint_patent(
        self, 
        title: str, 
        creator: str, 
        category: str, 
        abstract: str, 
        claims: str, 
        supporting_url: Optional[str] = ""
    ) -> dict:
        """
        Evaluates a new intellectual property proposal using real-time Web Search 
        and LLM Consensus before automatically minting it as an on-chain NFT.
        """
        # Ensure robust parameter validation
        if not title or not creator or not abstract or not claims:
            gl.revert("Invalid parameters: title, creator, abstract, and claims are required.")

        # 1. Non-Deterministic Web Search (Oracle Lookup)
        # Validators will query the global web (scientific journals, patents, preprint archives)
        search_query = f"patent prior art search academic papers: {title} {category} {abstract[:60]}"
        web_results = gl.nondet.web.search(search_query)

        # 2. Non-Deterministic Multi-Agent Audit Prompt
        # Each GenLayer validator runs this prompt to evaluate the IP independently.
        prompt = f"""
        [ROLE] You are an expert patent examiner for GenLayer Decentralized Patent Office.
        [OBJECTIVE] Analyze the following patent submission for Novelty, Inventive Step, and Utility.
        
        [PROPOSAL DETAILS]
        - Title: {title}
        - Category: {category}
        - Abstract: {abstract}
        - Claims: {claims}
        - Supporting URL: {supporting_url}
        
        [PRIOR ART WEB FINDINGS]
        {web_results}
        
        [EVALUATION GUIDELINES]
        1. Compare the claims against prior art web findings. Is there a direct conflict?
        2. Grade Novelty, Inventive Step, and Utility on a 0-100 scale.
        3. Make an ultimate decision: "APPROVED" if no prior art overrides the claims, otherwise "REJECTED".
        4. Provide an exhaustive rationale and list found URLs.
        
        [OUTPUT FORMAT] Respond strictly in JSON format matching this schema:
        {{
            "decision": "APPROVED" | "REJECTED",
            "novelty_score": int,
            "inventive_score": int,
            "utility_score": int,
            "tier": "Standard" | "Gold" | "Platinum",
            "rationale": "string",
            "prior_art_references": ["string"]
        }}
        """
        
        # Each validator executes the LLM non-deterministically
        evaluation = gl.nondet.exec_prompt(prompt, response_type=dict)

        # 3. Equivalence Principle (gl.eq_principle)
        # GenLayer ensures that if multiple validators return equivalent results,
        # consensus is met and the execution is committed to the ledger.
        if evaluation["decision"] == "APPROVED":
            current_id = self.patent_counter.get()
            nft_id = f"GL-NFT-{current_id:03d}"
            self.patent_counter.set(current_id + 1)
            
            patent_data = {
                "id": nft_id,
                "title": title,
                "creator": creator,
                "category": category,
                "abstract": abstract,
                "claims": claims,
                "status": "APPROVED",
                "tier": evaluation.get("tier", "Standard"),
                "average_score": (evaluation.get("novelty_score", 70) + evaluation.get("inventive_score", 70) + evaluation.get("utility_score", 70)) // 3,
                "validators": [
                    {
                        "name": "Scholar AI",
                        "role": "Scientific Peer Reviewer",
                        "decision": "APPROVED",
                        "noveltyScore": evaluation.get("novelty_score", 85),
                        "inventiveScore": evaluation.get("inventive_score", 80),
                        "utilityScore": evaluation.get("utility_score", 90),
                        "rationale": evaluation.get("rationale", "Highly novel approach based on web search results."),
                        "priorArtReferences": evaluation.get("prior_art_references", [])
                    }
                ]
            }
            
            self.patents[nft_id] = patent_data
            return patent_data
        else:
            gl.revert(f"Failed Patent Evaluation: Proposal rejected during validator consensus due to prior art overlap.")

    @gl.public
    def challenge_patent(
        self, 
        patent_id: str, 
        challenger: str, 
        explanation: str, 
        prior_art_url: str
    ) -> dict:
        """
        Allows third-party researchers to challenge any approved patent by presenting 
        new prior art. Validator nodes re-examine the claim non-deterministically.
        """
        if not self.patents.has_key(patent_id):
            gl.revert(f"Error: Patent {patent_id} does not exist.")
            
        patent_to_review = self.patents[patent_id]
        
        # 1. Non-Deterministic Oracle evaluation of the challenge
        challenge_prompt = f"""
        [ROLE] Patent Appeals Board Agent.
        [CONTEXT] A registered IP NFT is being challenged.
        - Existing Patent Title: {patent_to_review['title']}
        - Claims: {patent_to_review['claims']}
        
        [CHALLENGE DATA]
        - Challenger: {challenger}
        - Explanation: {explanation}
        - Challenger Prior Art URL: {prior_art_url}
        
        [TASK] Search the web for '{prior_art_url}' and decide if this challenge is valid.
        [OUTPUT] JSON: {{"challenge_valid": true/false, "rationale": "string"}}
        """
        
        challenge_eval = gl.nondet.exec_prompt(challenge_prompt, response_type=dict)
        
        if challenge_eval["challenge_valid"]:
            # Demote or revoke the patent based on LLM validator vote
            patent_to_review["status"] = "REVOKED"
            self.patents[patent_id] = patent_to_review
            return {"status": "REVOKED", "reason": challenge_eval["rationale"]}
        else:
            return {"status": "DISPUTE_REJECTED", "reason": "Validators found the challenge groundless."}

    @gl.public
    def get_patent(self, patent_id: str) -> dict:
        """
        Read-only query to fetch a patent's metadata.
        """
        if not self.patents.has_key(patent_id):
            gl.revert("Patent not found")
        return self.patents[patent_id]`;

  const getValidatorIcon = (name: string) => {
    switch (name) {
      case 'Scholar AI': return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case 'Legal Counsel AI': return <Scale className="w-5 h-5 text-purple-400" />;
      case 'Industry Expert AI': return <Cpu className="w-5 h-5 text-emerald-400" />;
      default: return <Network className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl h-[85vh] bg-[#050505] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]">
          <div>
            <span className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase block mb-1">AI AUDIT LOG & BLOCKCHAIN CONSENSUS REPORT</span>
            <h2 className="text-lg font-serif italic text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              GenLayer Smart Collection: {patent.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Content Tabs Nav */}
        <div className="flex border-b border-white/10 px-6 bg-[#080808]">
          <button
            onClick={() => setActiveTab('validators')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'validators'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Validator Nodes Status
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            GenLayer Smart Contract (Python)
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050505]">
          {activeTab === 'validators' ? (
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-center p-2 border-l border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">وضعیت نهایی</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider ${
                    patent.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {patent.status === 'APPROVED' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {patent.status}
                  </span>
                </div>
                <div className="text-center p-2 border-l border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">میانگین امتیاز نوآوری</span>
                  <span className="text-xl font-serif italic text-indigo-400">{patent.averageScore}٪</span>
                </div>
                <div className="text-center p-2 border-l border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">اجماع داوران (Consensus)</span>
                  <span className="text-xs font-mono text-white">
                    {patent.validators.filter(v => v.decision === 'APPROVED').length} / {patent.validators.length} رای موافق
                  </span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">مکانیسم اثبات</span>
                  <span className="text-[10px] font-mono text-purple-400 block mt-1">Proof of AI Consensus</span>
                </div>
              </div>

              {/* Validator Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {patent.validators.map((validator, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="flex flex-col bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shadow-lg"
                  >
                    {/* Card Head */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.01]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white/5 border border-white/10 rounded-sm">
                          {getValidatorIcon(validator.name)}
                        </div>
                        <div>
                          <h4 className="font-serif italic text-white text-sm">{validator.name}</h4>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{validator.role}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest ${
                        validator.decision === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                      }`}>
                        {validator.decision === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {validator.decision}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col space-y-4">
                      {/* Metric Scores */}
                      <div className="grid grid-cols-3 gap-2 text-center bg-black/40 p-2.5 rounded-sm border border-white/5 font-mono">
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Novelty</span>
                          <span className="text-xs font-bold text-indigo-400">{validator.noveltyScore}%</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Inventive Step</span>
                          <span className="text-xs font-bold text-purple-400">{validator.inventiveScore}%</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Utility</span>
                          <span className="text-xs font-bold text-emerald-400">{validator.utilityScore}%</span>
                        </div>
                      </div>

                      {/* Rationale Text */}
                      <div className="flex-1">
                        <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1.5">Validator Rationale:</span>
                        <p className="text-xs text-slate-300 italic leading-relaxed bg-black/30 p-3 rounded-sm border border-white/5">
                          "{validator.rationale}"
                        </p>
                      </div>

                      {/* References/Search Grounding findings */}
                      {validator.priorArtReferences && validator.priorArtReferences.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1.5">
                            <Search className="w-3.5 h-3.5 text-indigo-400" />
                            Web-Discovered Evidence (Prior Art):
                          </span>
                          <ul className="space-y-1">
                            {validator.priorArtReferences.map((ref, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5 text-slate-400 text-[11px] font-mono">
                                <span className="text-slate-600 mt-1">•</span>
                                <span className="leading-snug break-all">{ref}</span>
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
              {/* Educational Sidebar - 4 cols */}
              <div className="lg:col-span-4 space-y-4">
                {/* Actions Panel */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 shadow-lg text-left">
                  <h4 className="font-serif italic text-white text-sm border-b border-white/5 pb-2">Developer Toolkit (SDK Kit)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This code is a reference and fully reusable implementation of GenLayer smart contracts for registering dynamic on-chain IP NFTs.
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contractCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Python Source</span>
                        </>
                      )}
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => {
                        const blob = new Blob([contractCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'intelligent_patent.py';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-200 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                      <span>Download intelligent_patent.py</span>
                    </button>
                  </div>
                </div>

                {/* Core Architecture Explanations */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 text-left">
                  <h4 className="font-serif italic text-white text-sm border-b border-white/5 pb-2 flex items-center gap-2 justify-start">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    GenLayer Core Architecture
                  </h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-indigo-300 font-mono block">1. Secure State Design:</span>
                      <p className="text-slate-400 leading-relaxed">
                        Usage of secure on-chain state variables like <code className="bg-black/40 border border-white/10 px-1 py-0.5 rounded text-pink-400 font-mono text-[10px]">gl.storage.dict()</code> and <code className="bg-black/40 border border-white/10 px-1 py-0.5 rounded text-pink-400 font-mono text-[10px]">gl.storage.int()</code> to guarantee decentralized state integrity.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-indigo-300 font-mono block">2. Non-Deterministic Web Oracles:</span>
                      <p className="text-slate-400 leading-relaxed">
                        Invoking the <code className="bg-black/40 border border-white/10 px-1 py-0.5 rounded text-indigo-400 font-mono text-[10px]">gl.nondet.web.search()</code> method enables real-time, parallel web lookups across scientific portals and official patent directories.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-indigo-300 font-mono block">3. The Equivalence Principle:</span>
                      <p className="text-slate-400 leading-relaxed">
                        The GenLayer protocol assigns non-deterministic functions to multiple independent validators simultaneously. The execution is only committed once validator evaluations reach consensus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Viewer Container - 8 cols */}
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-sm border border-indigo-500/20">
                      <Code className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-serif italic text-white text-sm">GenLayer Testnet Reference Implementation</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        This Python smart contract is deployed on GenLayer, managing the registration, validation, and dispute lifecycle of intellectual property certificates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl border border-white/10 overflow-hidden bg-black font-mono text-[11px] leading-relaxed shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">intelligent_patent.py</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">GenLayer Python SDK v0.4.0</span>
                  </div>
                  <div className="overflow-x-auto p-4 text-slate-300 max-h-[55vh] text-left" dir="ltr">
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
