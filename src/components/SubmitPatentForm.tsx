import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatentNFT } from '../types';
import { Send, Sparkles, HelpCircle, ArrowLeft, Loader2, Network, Globe, ShieldCheck } from 'lucide-react';

interface SubmitPatentFormProps {
  onSubmit: (patentData: any) => Promise<PatentNFT | null>;
  onCancel: () => void;
}

export default function SubmitPatentForm({ onSubmit, onCancel }: SubmitPatentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    creator: '',
    category: 'هوش مصنوعی و داده‌های کلان',
    abstract: '',
    claims: '1. روشی برای ...\n2. سامانه‌ای متشکل از ...\n3. فرآیند پویای انتقال داده بر مبنای ...',
    supportingUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const categories = [
    'هوش مصنوعی و داده‌های کلان',
    'کریپتوگرافی و امنیت شبکه',
    'زیست‌فناوری و مهندسی پزشکی',
    'فناوری‌های پاک و انرژی نو',
    'اینترنت اشیاء (IoT) و سخت‌افزار',
    'سایر صنایع پیشرفته'
  ];

  const loadingSteps = [
    'در حال ارسال داده‌های اختراع به شبکه آزمایشی جن‌لایر...',
    'در حال راه‌اندازی ۳ گره ولیدیتور مستقل (Scholar, Legal, Industry Expert)...',
    'در حال اجرای وب‌سرچ هوشمند (gl.nondet.web) برای بررسی پیشینه اختراع در گوگل و آرکایو...',
    'در حال بررسی ادعاها و نوآوری فنی توسط مدل‌های زبانی (gl.nondet.exec_prompt)...',
    'در حال محاسبه هم‌ارزی آرا و اجماع نهایی داوران (gl.eq_principle)...',
    'موفقیت‌آمیز! در حال تولید گرافیک مدرن و صدور NFT هوشمند در دفترکل جن‌لایر...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.creator || !formData.abstract || !formData.claims) {
      alert('لطفاً تمامی فیلدهای اجباری را تکمیل فرمایید.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    // Dynamic fake stepper progress that matches backend real execution
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    try {
      const res = await onSubmit(formData);
      if (res) {
        setLoadingStep(5);
        setTimeout(() => {
          clearInterval(interval);
          setIsLoading(false);
        }, 1500);
      } else {
        clearInterval(interval);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#050505] border border-white/10 rounded-xl overflow-hidden p-6 md:p-8 relative">
      <AnimatePresence mode="wait">
        {!isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="form"
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-sm text-indigo-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-serif italic text-white tracking-tight">ثبت و ارزیابی ایده جدید (IP NFT)</h2>
                  <p className="text-xs text-slate-400 mt-1">با استفاده از اجماع غیرقطعی و داوری هوش مصنوعی شبکه جن‌لایر</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> بازگشت
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-5 text-right" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    عنوان علمی یا اختراع <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: باتری لیتیوم-سولفور با کاتد نانوساختار متخلخل"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    id="input-title"
                  />
                </div>

                {/* Creator */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    پدیدآورنده / مخترع <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.creator}
                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                    placeholder="نام و نام خانوادگی مخترع یا شرکت"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    id="input-creator"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">دسته‌بندی فناوری</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-sans cursor-pointer"
                  id="input-category"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} className="bg-[#050505] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Abstract */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  خلاصه فنی ایده (Abstract) <span className="text-red-500">*</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400 cursor-help" title="این متن توسط گره‌های هوشمند جن‌لایر تحلیل می‌شود" />
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="توصیف فنی کاملی از نوآوری خود، روش کارکرد و تفاوت آن با راه‌حل‌های موجود را بنویسید..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans leading-relaxed"
                  id="input-abstract"
                />
              </div>

              {/* Claims */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  ادعاهای ثبت اختراع (Patent Claims) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.claims}
                  onChange={(e) => setFormData({ ...formData, claims: e.target.value })}
                  placeholder="ادعاهای مستقل و وابسته اختراع خود را به صورت گام‌به‌گام تفکیک کنید..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans leading-relaxed"
                  id="input-claims"
                />
              </div>

              {/* Supporting URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">لینک مستندات تکمیلی / مقاله علمی (اختیاری)</label>
                <input
                  type="url"
                  value={formData.supportingUrl}
                  onChange={(e) => setFormData({ ...formData, supportingUrl: e.target.value })}
                  placeholder="https://example.com/paper.pdf"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono text-left"
                  dir="ltr"
                  id="input-url"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-white text-black px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors cursor-pointer"
                  id="btn-submit"
                >
                  ارسال به شبکه جن‌لایر (AI Consensus)
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Real-time holographic Loading Panel */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
            className="flex flex-col items-center justify-center py-16 text-center space-y-6 bg-[#050505]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
              <div className="relative p-6 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-inner">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              </div>
            </div>

            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-serif italic text-white flex items-center justify-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                در حال اجرای هوشمند قرارداد جن‌لایر
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[3rem] px-4 font-sans italic">
                {loadingSteps[loadingStep]}
              </p>
            </div>

            {/* Stepper progress indicator */}
            <div className="flex items-center gap-2 pt-2">
              {loadingSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === loadingStep
                      ? 'w-8 bg-indigo-500'
                      : idx < loadingStep
                      ? 'w-3 bg-emerald-500'
                      : 'w-3 bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest font-mono">
              GenLayer Validator Network (Nodes: 3) • gl.eq_principle: ACTIVE
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
