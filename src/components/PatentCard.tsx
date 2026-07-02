import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatentNFT } from '../types';
import { ShieldCheck, Award, Eye, Flame, AlertCircle, FileText, Globe, Calendar, User, ChevronDown, ChevronUp, Scale } from 'lucide-react';

interface PatentCardProps {
  key?: string;
  patent: PatentNFT;
  onViewConsensus: (patent: PatentNFT) => void;
  onChallenge: (patent: PatentNFT) => void;
}

export default function PatentCard({ patent, onViewConsensus, onChallenge }: PatentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'DISPUTED': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'REVOKED': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'GOLD':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
            <Award className="w-3.5 h-3.5" /> GOLD TIER
          </span>
        );
      case 'SILVER':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="w-3.5 h-3.5" /> SILVER TIER
          </span>
        );
      case 'BRONZE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
            <Scale className="w-3.5 h-3.5" /> BRONZE TIER
          </span>
        );
      default:
        return null;
    }
  };

  const formattedDate = new Date(patent.mintedAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      layout
      className={`relative rounded-xl overflow-hidden border bg-gradient-to-br ${patent.certificateStyle.bgGradient} ${patent.certificateStyle.borderColor || 'border-white/10'} hover:border-white/20 transition-all duration-300`}
      style={{ boxShadow: `0 10px 30px -10px ${patent.certificateStyle.glowColor || 'rgba(0,0,0,0.5)'}` }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      id={`patent-card-${patent.id}`}
    >
      {/* Visual Ambient Light Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Header */}
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-indigo-300 tracking-wider bg-white/5 border border-white/5 px-2.5 py-1 rounded-sm">
              {patent.id}
            </span>
            <span className={`text-[10px] px-2.5 py-1 rounded-sm border font-mono tracking-widest uppercase ${getStatusColor(patent.status)}`}>
              {patent.status === 'APPROVED' ? 'تایید شده / ON-CHAIN' : patent.status === 'DISPUTED' ? 'مورد اختلاف' : patent.status === 'REVOKED' ? 'ابطال شده' : patent.status}
            </span>
          </div>
          {getTierBadge(patent.tier)}
        </div>

        <h3 className="text-xl font-serif italic text-white tracking-wide leading-snug mb-3">
          {patent.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mb-4 border-b border-white/5 pb-4 font-mono">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-serif italic text-slate-300">{patent.creator}</span>
          </span>
          <span className="text-white/10">•</span>
          <span className="text-[10px] uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2 py-0.5 rounded-sm">
            {patent.category}
          </span>
          <span className="text-white/10">•</span>
          <span className="flex items-center gap-1 text-[10px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3 mb-5">
          "{patent.abstract}"
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={() => onViewConsensus(patent)}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-colors cursor-pointer"
            id={`btn-view-logs-${patent.id}`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            گزارش اجماع هوش مصنوعی
          </button>

          <div className="flex items-center gap-2">
            {patent.status !== 'REVOKED' && (
              <button
                onClick={() => onChallenge(patent)}
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
                id={`btn-challenge-${patent.id}`}
              >
                <Flame className="w-3.5 h-3.5" />
                چالش اصالت
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
              id={`btn-expand-${patent.id}`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/10 bg-black/20"
          >
            <div className="p-6 space-y-5 text-sm">
              {/* Claims Section */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-white/40 tracking-wider uppercase mb-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  ادعاهای ثبت شده (Patent Claims)
                </h4>
                <pre className="font-sans whitespace-pre-wrap text-white/80 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 font-normal text-xs">
                  {patent.claims}
                </pre>
              </div>

              {/* Supporting URL */}
              {patent.supportingUrl && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-white/40 tracking-wider uppercase mb-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    لینک مستندات / مراجع علمی
                  </h4>
                  <a
                    href={patent.supportingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    {patent.supportingUrl}
                  </a>
                </div>
              )}

              {/* Consensus Metadata */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="block text-[10px] text-white/40 font-bold uppercase mb-0.5">میانگین امتیاز نوآوری</span>
                  <span className="text-base font-bold text-indigo-400">{patent.averageScore}٪</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="block text-[10px] text-white/40 font-bold uppercase mb-0.5">تعداد گره‌های داور</span>
                  <span className="text-base font-bold text-emerald-400">{patent.validators.length}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="block text-[10px] text-white/40 font-bold uppercase mb-0.5">پروتکل اجماع</span>
                  <span className="text-[10px] font-mono font-bold text-purple-400">gl.eq_principle</span>
                </div>
              </div>

              {/* Challenges Log */}
              {patent.challenges.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-rose-400 tracking-wider uppercase">
                    <AlertCircle className="w-3.5 h-3.5" />
                    تاریخچه چالش‌ها و دعاوی اصالت ({patent.challenges.length})
                  </h4>
                  <div className="space-y-3">
                    {patent.challenges.map((c, idx) => (
                      <div key={idx} className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 text-xs">
                        <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                          <span>توسط: <strong className="text-white">{c.challenger}</strong></span>
                          <span>{new Date(c.timestamp).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <p className="text-white/80 mb-2 leading-relaxed">
                          <strong>شرح ادعای کپی‌رایت:</strong> {c.challengerExplanation}
                        </p>
                        {c.challengeUrl && (
                          <div className="mb-2">
                            <span className="text-white/40">سند کپی‌برداری: </span>
                            <a href={c.challengeUrl} target="_blank" rel="noreferrer" className="text-rose-400 underline">{c.challengeUrl}</a>
                          </div>
                        )}
                        {c.resolution && (
                          <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-white/90">
                            <strong className="text-emerald-400 block mb-1">نتیجه بازبینی داوران هوشمند جن‌لایر:</strong>
                            <p className="leading-relaxed">{c.resolution}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
