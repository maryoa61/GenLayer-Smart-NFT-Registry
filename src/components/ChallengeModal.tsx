import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NFT_Record } from '../types';
import { AlertTriangle, Flame, Shield, X, Loader2 } from 'lucide-react';

interface ChallengeModalProps {
  nft: NFT_Record;
  onClose: () => void;
  onConfirmChallenge: (challengeData: { challenger: string; challengerExplanation: string; challengeUrl: string }) => Promise<void>;
}

export default function ChallengeModal({ nft, onClose, onConfirmChallenge }: ChallengeModalProps) {
  const [challenger, setChallenger] = useState('');
  const [explanation, setExplanation] = useState('');
  const [challengeUrl, setChallengeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenger || !explanation) {
      alert('All starred fields are required.');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirmChallenge({
        challenger,
        challengerExplanation: explanation,
        challengeUrl
      });
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-black border border-yellow-500/30 rounded-xl shadow-2xl overflow-hidden p-6 shadow-[0_0_35px_rgba(234,179,8,0.15)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-400 p-1 hover:bg-yellow-500/5 border border-transparent hover:border-yellow-500/20 rounded-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="form"
              className="space-y-5 text-left"
              dir="ltr"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5 border-b border-yellow-500/20 pb-4">
                <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-sm border border-yellow-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif italic text-yellow-400 leading-none">Challenge Authenticity</h3>
                  <p className="text-xs text-yellow-500/80 mt-1.5">File dispute claim against NFT #{nft.token_id}</p>
                </div>
              </div>

              {/* Warning box */}
              <div className="bg-yellow-950/10 border border-yellow-500/25 p-3.5 rounded-sm text-xs text-yellow-300 leading-relaxed italic">
                <div className="flex items-center gap-1.5 font-bold mb-1 font-mono uppercase tracking-wider text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  CRITICAL NOTICE:
                </div>
                You are challenging a registered NFT. GenLayer AI validator nodes will automatically crawl the web to cross-reference your submitted evidence, review historical dates, and determine whether to demote, preserve, or REVOKE this token.
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-yellow-500/80">
                    Challenger Address / Name <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={challenger}
                    onChange={(e) => setChallenger(e.target.value)}
                    placeholder="e.g. 0xChallenger... or Oxford Labs"
                    className="w-full px-4 py-2 bg-black border border-yellow-500/25 rounded-sm text-xs text-yellow-400 placeholder-yellow-800/60 focus:outline-none focus:border-yellow-400 font-sans"
                    id="challenger-name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-yellow-500/80">
                    Prior Art / Original Publication Link
                  </label>
                  <input
                    type="url"
                    value={challengeUrl}
                    onChange={(e) => setChallengeUrl(e.target.value)}
                    placeholder="https://original-source.com/artwork-2024"
                    className="w-full px-4 py-2 bg-black border border-yellow-500/25 rounded-sm text-xs text-yellow-400 placeholder-yellow-800/60 focus:outline-none focus:border-yellow-400 font-mono text-left"
                    dir="ltr"
                    id="challenger-url"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-yellow-500/80">
                    Dispute Explanation & Detailed Proof <span className="text-yellow-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Explain why this NFT is not novel. Tip: write 'revoke' or 'stolen' to simulate a successful revoking consensus outcome."
                    className="w-full px-4 py-3 bg-black border border-yellow-500/25 rounded-sm text-xs text-yellow-400 placeholder-yellow-800/60 focus:outline-none focus:border-yellow-400 font-sans leading-relaxed"
                    id="challenger-explanation"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-yellow-500/20">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black font-bold rounded-sm text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
                    id="btn-confirm-challenge"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Submit Challenge
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Running Challenge consensus simulation loader */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              key="loading"
              className="flex flex-col items-center justify-center py-10 text-center space-y-5 bg-black"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/15 rounded-full blur-xl animate-pulse" />
                <div className="relative p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-serif italic text-yellow-400 flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  GenLayer Challenge Consensus Evaluation
                </h4>
                <p className="text-xs text-yellow-500/80 leading-relaxed font-sans italic">
                  Smart validators are matching your challenge claims against the NFT's original creation parameters and scientific web records. This process may take a few moments...
                </p>
              </div>

              <span className="text-[9px] font-bold tracking-widest text-yellow-600 uppercase font-mono">
                GenLayer Oracle Web Lookup • Analyzing claims...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
