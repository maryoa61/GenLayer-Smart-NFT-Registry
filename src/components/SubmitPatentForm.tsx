import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Network, HelpCircle, DollarSign } from 'lucide-react';

interface SubmitPatentFormProps {
  onCancel: () => void;
  onSuccess: (newNft: any) => void;
}

export default function SubmitPatentForm({ onCancel, onSuccess }: SubmitPatentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    creator: '',
    category: 'Digital Art',
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
    'Submitting transaction payload to GenLayer sandbox pool...',
    'Spinning up 3 intelligent validator nodes (Scholar AI, Legal Counsel AI, Industry Expert AI)...',
    'Executing sandboxed web crawl to detect duplicate/plagiarized creations...',
    'Performing multi-agent LLM analysis on artistic description and novelty features...',
    'Computing vote equivalence and consensus results via gl.eq_principle...',
    'Writing permanent record to the ledger & confirming authenticity status...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.creator || !formData.description || !formData.mediaUrl) {
      alert('لطفاً تمامی فیلدهای الزامی را تکمیل کنید.');
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
      const res = await fetch('/api/nfts/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          media_url: formData.mediaUrl,
          category: formData.category,
          creator: formData.creator,
          fee_sent: formData.feeSent
        })
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
      alert("خطا در اجرای تراکنش در گره شبیه‌ساز GenLayer.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black border border-indigo-500/30 rounded-xl overflow-hidden p-6 sm:p-8 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
      {!loading ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-sm border border-indigo-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-serif italic text-indigo-400 tracking-tight">ثبت اثر و ثبت اصالت در GenLayer</h2>
                <p className="text-xs text-indigo-500/70 mt-1">
                  تحت نظارت گره‌های اعتبارسنج هوش مصنوعی چندعاملی و بررسی پایگاه داده‌های برخط.
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> بازگشت
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-right">
              {/* Creator Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-indigo-500/80">
                  آدرس سازنده (Minter Address) <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  placeholder="مثال: 0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a"
                  className="w-full px-4 py-2.5 bg-black border border-indigo-500/25 rounded-sm text-xs text-indigo-400 placeholder-indigo-800/60 focus:outline-none focus:border-indigo-400 transition-all font-mono text-left"
                  id="input-creator"
                  dir="ltr"
                />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-indigo-500/80">
                  عنوان اثر (Title) <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: غروب دیجیتال"
                  className="w-full px-4 py-2.5 bg-black border border-indigo-500/25 rounded-sm text-xs text-indigo-400 placeholder-indigo-800/60 focus:outline-none focus:border-indigo-400 transition-all font-sans"
                  id="input-title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-right">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-indigo-500/80">دسته‌بندی (Category)</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-indigo-500/25 rounded-sm text-xs text-indigo-400 focus:outline-none focus:border-indigo-400 transition-all font-sans"
                  id="select-category"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-black text-indigo-400">{c}</option>
                  ))}
                </select>
              </div>

              {/* Media URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-indigo-500/80">
                  لینک تصویر یا مدیا (Media URL) <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-... or digital-art.png"
                  className="w-full px-4 py-2.5 bg-black border border-indigo-500/25 rounded-sm text-xs text-indigo-400 placeholder-indigo-800/60 focus:outline-none focus:border-indigo-400 transition-all font-mono text-left"
                  id="input-media-url"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-[11px] font-mono uppercase tracking-wider text-indigo-500/80 flex items-center gap-1.5 justify-end">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 hover:text-indigo-400 cursor-help" title="توسط اعتبارسنج‌ها برای بررسی اصالت و تشخیص سرقت ادبی تحلیل می‌شود." />
                توضیحات اثر و بیانیه هنری <span className="text-indigo-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="توضیحات کاملی درباره اثر خود بنویسید. راهنما: برای شبیه‌سازی ردِ تراکنش توسط هوش مصنوعی به دلیل سرقت ادبی، در عنوان یا توضیحات از کلمه 'copy' یا 'stolen' استفاده کنید."
                className="w-full px-4 py-3 bg-black border border-indigo-500/25 rounded-sm text-xs text-indigo-400 placeholder-indigo-800/60 focus:outline-none focus:border-indigo-400 transition-all font-sans leading-relaxed"
                id="input-description"
              />
            </div>

            {/* Custom Minting Fee Slider */}
            <div className="bg-black border border-indigo-500/15 p-4 rounded-sm space-y-3.5 shadow-inner text-right">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5 justify-end">
                    <DollarSign className="w-4 h-4 text-indigo-400" />
                    هزینه ضرب و کارمزد تراکنش
                  </h4>
                  <p className="text-[11px] text-indigo-500/60 mt-1">
                    حداقل هزینه مورد نیاز: <span className="text-indigo-400 font-mono font-bold">0.05 GETH</span>. مابقی به طور خودکار به عنوان اضافه پرداختی در نظر گرفته می‌شود.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-sm">
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
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-indigo-500/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-indigo-600/70" dir="ltr">
                <span>0.05 GETH (Standard Mint)</span>
                <span>0.50 GETH</span>
                <span>1.00 GETH (Trigger Overpay Refund)</span>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-indigo-500/20 text-right">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-sm text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white active:bg-indigo-600 font-bold rounded-sm text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                id="btn-submit"
              >
                <Network className="w-3.5 h-3.5" />
                ارسال به استخر اعتبارسنجی GenLayer
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Dynamic Loader simulating GenLayer Node Consensus and Web Scrapes */
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-full animate-spin flex items-center justify-center">
              <Network className="w-12 h-12 text-indigo-400" />
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            <h3 className="text-lg font-serif italic text-indigo-400 flex items-center justify-center gap-2">
              اجرای قرارداد هوشمند در GenLayer Sandbox
            </h3>
            <p className="text-xs text-indigo-500/80 leading-relaxed min-h-[3rem] px-4 font-sans italic">
              {loadingSteps[loadingStep]}
            </p>
          </div>

          {/* Interactive loading step checkboxes */}
          <div className="w-full max-w-sm bg-black border border-indigo-500/20 p-4 rounded-sm text-left font-mono text-[10px] space-y-2 text-indigo-600" dir="ltr">
            {loadingSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={idx < loadingStep ? "text-indigo-400 font-bold" : idx === loadingStep ? "text-indigo-300 animate-pulse" : "text-zinc-800/40"}>
                  {idx < loadingStep ? "✓" : idx === loadingStep ? "●" : "○"}
                </span>
                <span className={idx < loadingStep ? "text-indigo-600/50 line-through" : idx === loadingStep ? "text-indigo-300" : "text-indigo-800"}>
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
