import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Network, HelpCircle, AlertTriangle, Layers, DollarSign } from 'lucide-react';
import { NFT_Record } from '../types';

interface SubmitPatentFormProps {
  parentNft?: NFT_Record | null;
  onCancel: () => void;
  onSuccess: (newNft: any) => void;
}

export default function SubmitPatentForm({ parentNft = null, onCancel, onSuccess }: SubmitPatentFormProps) {
  const [formData, setFormData] = useState({
    title: parentNft ? `Remix of ${parentNft.title}` : '',
    creator: '',
    category: parentNft ? parentNft.category : 'Digital Art',
    description: '',
    mediaUrl: '',
    feeSent: '0.05' // required fee is 0.05
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const categories = [
    'Digital Art',
    'Photography',
    'Music',
    '3D Model',
    'Text/Literary'
  ];

  const loadingSteps = [
    'Submitting transaction payload to GenLayer Testnet pool...',
    'Spinning up 3 non-deterministic validator nodes (Scholar AI, Legal Counsel AI, Industry Expert AI)...',
    'Executing live web index scan via gl.nondet.web.render to detect duplicate creations...',
    'Performing multi-agent LLM analysis on descriptions and style features via gl.nondet.exec_prompt...',
    'Computing vote equivalence and consensus results via gl.eq_principle...',
    'Writing permanent record to the ledger & distributing payout splits...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.creator || !formData.description || !formData.mediaUrl) {
      alert('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Simulate stepping through GenLayer consensus steps
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 900);

    try {
      const endpoint = parentNft ? '/api/nfts/mint-derivative' : '/api/nfts/mint';
      const payload = parentNft ? {
        parent_token_id: parentNft.token_id,
        title: formData.title,
        description: formData.description,
        media_url: formData.mediaUrl,
        creator: formData.creator,
        fee_sent: formData.feeSent
      } : {
        title: formData.title,
        description: formData.description,
        media_url: formData.mediaUrl,
        category: formData.category,
        creator: formData.creator,
        fee_sent: formData.feeSent
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // Pause briefly on the final step for a polished visual handoff
      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
        onSuccess(data);
      }, 5500);

    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setLoading(false);
      alert("Error executing transaction on GenLayer simulator node.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl p-6 sm:p-8">
      {!loading ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-sm border border-indigo-500/20">
                {parentNft ? <Layers className="w-6 h-6 animate-pulse" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <h2 className="text-xl font-serif italic text-white tracking-tight">
                  {parentNft ? "Mint AI-Remix Derivative" : "Mint Authenticity-Guaranteed NFT"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {parentNft 
                    ? `Registering a licensed derivative of Parent NFT #${parentNft.token_id}`
                    : "Gated by GenLayer multi-agent AI validator nodes and non-deterministic web scans."
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Warning Banner */}
          {parentNft && (
            <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-sm text-xs text-indigo-200 flex gap-3 italic">
              <AlertTriangle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <span className="font-bold uppercase font-mono block mb-0.5 tracking-wider">Lineage Royalty Link Locked:</span>
                This derivative will be analyzed by validators to assign a <strong className="text-indigo-300">Similarity Score</strong>. If approved, a proportional royalty rate (e.g. 50% similarity = 5% royalty) will be locked to original creator <strong className="text-indigo-300">{parentNft.creator.slice(0,8)}...{parentNft.creator.slice(-6)}</strong> and automatically routed on all future secondary marketplace sales!
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Creator Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Minter Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  placeholder="e.g. 0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  id="input-creator"
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  {parentNft ? "Derivative Title" : "NFT Title"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Synth-wave Horizon Redux"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  id="input-title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Category</label>
                <select
                  disabled={!!parentNft}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-sans disabled:opacity-50"
                  id="select-category"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Media URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Artwork Media Link / URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-... or digital-art.png"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  id="input-media-url"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                Technical Description & Artistic Intent <span className="text-red-500">*</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400 cursor-help" title="Parsed by validators to check uniqueness and determine similarity ratio." />
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={parentNft 
                  ? "Describe your creative remix. What visual, styling, or structural additions have you introduced over the parent NFT?"
                  : "Explain your creation in detail. Tip: write 'stolen' or 'copy' in the Title/Description to simulate an automatic anti-plagiarism Node Rejection outcome!"
                }
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans leading-relaxed"
                id="input-description"
              />
            </div>

            {/* Custom Minting Fee / Refund Overpay interactive slider */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-indigo-400" />
                    Transaction Gas & Value Attached
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Minimum required: <span className="text-white font-mono font-bold">0.05 GETH</span>. Excess is automatically credited to your pull-payment balance!
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-white bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-sm">
                    {formData.feeSent} GETH
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={formData.feeSent}
                onChange={(e) => setFormData({ ...formData, feeSent: e.target.value })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0.05 GETH (Standard Mint Fee)</span>
                <span>0.50 GETH</span>
                <span>1.00 GETH (Trigger Overpay Refund)</span>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-sm text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                id="btn-submit"
              >
                <Network className="w-3.5 h-3.5" />
                Submit to GenLayer Validator Pool
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Dynamic Loader simulating GenLayer Node Consensus and Web Scrapes */
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-white/5 border border-white/10 rounded-full animate-spin flex items-center justify-center">
              <Network className="w-12 h-12 text-indigo-400" />
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            <h3 className="text-lg font-serif italic text-white flex items-center justify-center gap-2">
              Executing GenLayer Intelligent Contract
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed min-h-[3rem] px-4 font-sans italic">
              {loadingSteps[loadingStep]}
            </p>
          </div>

          {/* Interactive loading step checkboxes */}
          <div className="w-full max-w-sm bg-black/40 border border-white/10 p-4 rounded-sm text-left font-mono text-[10px] space-y-2 text-slate-500">
            {loadingSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={idx < loadingStep ? "text-indigo-400 font-bold" : idx === loadingStep ? "text-white animate-pulse" : "text-slate-700"}>
                  {idx < loadingStep ? "✓" : idx === loadingStep ? "●" : "○"}
                </span>
                <span className={idx < loadingStep ? "text-slate-300 line-through" : idx === loadingStep ? "text-white" : "text-slate-600"}>
                  {step.slice(0, 48)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
