import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Plus, Search, Cpu, RefreshCw, Sparkles, Filter, 
  User, Terminal, HelpCircle, History, ClipboardList, CheckCircle, 
  Copy, ExternalLink, Check, Send
} from 'lucide-react';
import { NFT_Record } from './types';
import SubmitPatentForm from './components/SubmitPatentForm';
import ConsensusVisualizer from './components/ConsensusVisualizer';

export default function App() {
  const [nfts, setNfts] = useState<NFT_Record[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Wallet States (Sandbox mode)
  const mockWallets = [
    { address: "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd", name: "Artist Creator Alpha" },
    { address: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a", name: "Artist Creator Golden Remix" },
    { address: "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8", name: "Secondary Collector & Trader" },
    { address: "0x77ff81a299a9a30485aef901b007ea1221fbc44", name: "External Challenger Node" }
  ];
  
  const [currentWallet, setCurrentWallet] = useState(mockWallets[0]);
  const [walletBalance, setWalletBalance] = useState("12.50");

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedNft, setSelectedNft] = useState<NFT_Record | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Transfer NFT Form states
  const [nftToTransfer, setNftToTransfer] = useState<NFT_Record | null>(null);
  const [transferTargetAddress, setTransferTargetAddress] = useState('');

  // Simulated live metrics
  const [blockHeight, setBlockHeight] = useState(842910);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const addLogLocal = (method: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO') => {
    const newLog = {
      timestamp: new Date().toISOString(),
      txHash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6),
      method,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Fetch full state from backend
  const fetchData = async () => {
    try {
      // 1. Fetch NFTs
      const nftsRes = await fetch('/api/nfts');
      const nftsData = await nftsRes.json();
      if (Array.isArray(nftsData)) {
        setNfts(nftsData);
      }

      // 2. Fetch GLVM logs
      const logsRes = await fetch('/api/logs');
      const logsData = await logsRes.json();
      if (Array.isArray(logsData)) {
        setLogs(logsData);
      }

    } catch (err) {
      console.error('Error fetching protocol details:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Update simulator wallet balances dynamically to make UI live
  useEffect(() => {
    if (currentWallet.address.startsWith("0x4A7b")) setWalletBalance("14.25");
    else if (currentWallet.address.startsWith("0x98Be")) setWalletBalance("8.10");
    else if (currentWallet.address.startsWith("0x33Aa")) setWalletBalance("45.00");
    else setWalletBalance("3.50");
  }, [currentWallet]);

  const handleRegisterSuccess = async () => {
    await fetchData();
    setShowSubmitForm(false);
  };

  const handleAuditProvenance = async (tokenId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/nfts/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          caller: currentWallet.address
        })
      });
      await fetchData();
    } catch (err) {
      console.error("Error auditing NFT:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferNft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftToTransfer || !transferTargetAddress) return;

    try {
      const res = await fetch('/api/nfts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: nftToTransfer.token_id,
          to: transferTargetAddress,
          caller: currentWallet.address
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(`انتقال با موفقیت انجام شد! اثر #${nftToTransfer.token_id} به آدرس ${transferTargetAddress} منتقل گردید.`);
        setNftToTransfer(null);
        setTransferTargetAddress('');
        await fetchData();
      }
    } catch (err) {
      console.error("Error transferring NFT:", err);
    }
  };

  // Filtered lists
  const filteredNfts = nfts.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || nft.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || nft.authenticity_status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col font-sans relative overflow-x-hidden antialiased" dir="rtl">
      {/* Absolute Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/3 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Protocol Bar */}
      <header className="border-b border-indigo-500/20 bg-black/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-sm border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Network className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif italic text-indigo-400 tracking-tight font-bold">Genesis Proof</h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-sm">
                  SANDBOX SIMULATION
                </span>
              </div>
              <p className="text-[11px] text-indigo-500/80 font-sans tracking-wide">
                ثبت اصالت آثار، تحلیل غیرمتمرکز نوآوری و مانیتورینگ گره‌های اعتبارسنجی چندعاملی
              </p>
            </div>
          </div>

          {/* User Wallet Control (Simulation) */}
          <div className="flex flex-wrap items-center gap-3.5 bg-indigo-500/[0.02] border border-indigo-500/20 p-2 rounded-sm max-w-full">
            {/* Wallet Select */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black border border-indigo-500/10 rounded-sm" dir="ltr">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={currentWallet.address}
                onChange={(e) => {
                  const found = mockWallets.find(w => w.address === e.target.value);
                  if (found) {
                    setCurrentWallet(found);
                    addLogLocal("SWITCH_WALLET", `Switched active wallet context to ${found.name}`, "INFO");
                  }
                }}
                className="bg-transparent text-xs text-indigo-400 focus:outline-none cursor-pointer font-mono text-[11px]"
              >
                {mockWallets.map(w => (
                  <option key={w.address} value={w.address} className="bg-black text-indigo-400">
                    {w.name} ({w.address.slice(0,6)}...{w.address.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Balances Display */}
            <div className="flex items-center gap-4 text-xs font-mono" dir="ltr">
              <div>
                <span className="text-[9px] text-indigo-600/70 uppercase block leading-none">Wallet</span>
                <span className="text-indigo-400 font-bold">{walletBalance} GETH</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Live Sandbox Metrics Banner */}
      <section className="bg-black border-b border-indigo-500/10 py-3.5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-right font-mono text-[11px]">
          <div className="space-y-0.5">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">ارتفاع بلاک (Block Height)</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1.5 justify-end">
              <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
              {blockHeight}
            </span>
          </div>
          <div className="space-y-0.5 border-r border-indigo-500/10 pr-4">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">وضعیت شبکه (Network Status)</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              گره شبیه‌ساز (Sandbox Node)
            </span>
          </div>
          <div className="space-y-0.5 border-r border-indigo-500/10 pr-4">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">کارمزد پایه ثبت اصالت</span>
            <span className="text-indigo-400 font-bold">0.05 GETH</span>
          </div>
          <div className="space-y-0.5 border-r border-indigo-500/10 pr-4">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">کل آثار ثبت شده</span>
            <span className="text-indigo-400 font-bold">{nfts.length} عدد</span>
          </div>
        </div>
      </section>

      {/* Main Sandbox Layout */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Minting Form overlay OR Main Explorer Grid */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {showSubmitForm ? (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <SubmitPatentForm
                  onCancel={() => setShowSubmitForm(false)}
                  onSuccess={handleRegisterSuccess}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Search & Action Panel */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-black border border-indigo-500/20 p-4 rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.05)]">
                  {/* Search bar */}
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black border border-indigo-500/10 rounded-sm">
                    <Search className="w-4 h-4 text-indigo-600" />
                    <input
                      type="text"
                      placeholder="جستجوی عنوان، توضیحات، آدرس سازنده..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-indigo-400 placeholder-indigo-800/60 focus:outline-none text-right"
                    />
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex items-center gap-3">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-black border border-indigo-500/20 text-xs text-indigo-400 px-3 py-2 rounded-sm focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="ALL">همه دسته‌ها</option>
                      <option value="Digital Art">هنر دیجیتال</option>
                      <option value="Photography">عکاسی</option>
                      <option value="Music">موسیقی</option>
                      <option value="3D Model">مدل سه بعدی</option>
                      <option value="Text/Literary">ادبیات و متن</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-black border border-indigo-500/20 text-xs text-indigo-400 px-3 py-2 rounded-sm focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="ALL">همه وضعیت‌ها</option>
                      <option value="VERIFIED_ORIGINAL">اصیل تایید شده (Verified)</option>
                      <option value="PROBABLE_ORIGINAL">احتمالاً اصیل (Probable)</option>
                      <option value="DISPUTED">دارای اختلاف (Disputed)</option>
                    </select>

                    <button
                      onClick={() => setShowSubmitForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] transition-all rounded-sm text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-500/10"
                    >
                      <Plus className="w-4 h-4" /> ثبت اثر جدید
                    </button>
                  </div>
                </div>

                {/* NFT Explorer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNfts.length > 0 ? (
                    filteredNfts.map((nft) => {
                      const isOwner = nft.owner.toLowerCase() === currentWallet.address.toLowerCase();

                      return (
                        <div
                          key={nft.token_id}
                          className="bg-black border border-indigo-500/20 rounded-xl overflow-hidden hover:border-indigo-400 transition-all flex flex-col h-full group relative shadow-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] text-right"
                        >
                          {/* Top Status Tags */}
                          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                            <span className="bg-black/90 backdrop-blur-md border border-indigo-500/20 text-[9px] font-mono text-indigo-400 px-2.5 py-0.5 rounded-sm uppercase font-bold">
                              {nft.category}
                            </span>
                          </div>

                          {/* Top Left Action status */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-mono tracking-wider bg-black/90 backdrop-blur-md border ${
                              nft.authenticity_status === 'VERIFIED_ORIGINAL' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                              nft.authenticity_status === 'PROBABLE_ORIGINAL' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' :
                              'border-amber-500/30 text-amber-500 bg-amber-500/10'
                            }`}>
                              ● {nft.authenticity_status}
                            </span>
                          </div>

                          {/* Media Box */}
                          <div className="h-44 bg-black relative overflow-hidden flex items-center justify-center border-b border-indigo-500/10">
                            <img
                              src={nft.media_url}
                              alt={nft.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {/* Title overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-4">
                              <h3 className="text-base font-serif italic text-indigo-400 leading-tight drop-shadow-md bg-black/60 px-2 py-0.5 rounded-sm">
                                {nft.title}
                              </h3>
                            </div>
                          </div>

                          {/* Card Content info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2 text-right">
                              <p className="text-xs text-indigo-500/80 leading-relaxed line-clamp-2 italic">
                                "{nft.description}"
                              </p>

                              {/* Owner & Creator addresses */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-indigo-600 pt-1.5 border-t border-indigo-500/10" dir="ltr">
                                <div>
                                  <span className="block text-[8px] text-indigo-600/50 uppercase">Original Creator</span>
                                  <span className="text-indigo-400 truncate block">
                                    {nft.creator.slice(0,6)}...{nft.creator.slice(-4)}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-indigo-600/50 uppercase">Current Owner</span>
                                  <span className="text-indigo-400 truncate block">
                                    {isOwner ? "YOU" : `${nft.owner.slice(0,6)}...${nft.owner.slice(-4)}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Score & Progress Bar */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-indigo-500/80 text-[10px]">درصد اطمینان از اصالت (CONFIDENCE)</span>
                                <span className="font-serif italic font-bold text-indigo-400">
                                  {nft.authenticity_score} / 100
                                </span>
                              </div>
                              <div className="h-1 bg-indigo-500/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    nft.authenticity_score >= 85 ? 'bg-emerald-500' :
                                    nft.authenticity_score >= 40 ? 'bg-indigo-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${nft.authenticity_score}%` }}
                                />
                              </div>
                            </div>

                            {/* Card Action Buttons footer */}
                            <div className="pt-3 border-t border-indigo-500/10 grid grid-cols-2 gap-2">
                              
                              <button
                                onClick={() => setSelectedNft(nft)}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer"
                              >
                                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                بررسی اجماع اعتبارسنج‌ها (AI Audit)
                              </button>

                              <button
                                onClick={() => handleAuditProvenance(nft.token_id)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black hover:bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                                disabled={isLoading}
                                title="اجرای اعتبارسنجی مجدد روی منابع برخط"
                              >
                                <History className="w-3.5 h-3.5 text-indigo-500" />
                                بررسی مجدد اصالت
                              </button>

                              {isOwner ? (
                                <button
                                  onClick={() => setNftToTransfer(nft)}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-950/20 hover:bg-indigo-950/30 text-indigo-400 border border-indigo-500/25 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                                  انتقال مالکیت
                                </button>
                              ) : (
                                <div className="text-center py-1.5 text-[10px] text-indigo-600/60 uppercase font-mono border border-indigo-500/5 bg-black">
                                  غیر قابل ویرایش
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 py-16 text-center border border-dashed border-indigo-500/20 rounded-xl text-indigo-600">
                      <ClipboardList className="w-8 h-8 text-indigo-700 mx-auto mb-3" />
                      <p className="text-xs">هیچ اثری با معیارهای انتخاب شده یافت نشد.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side Column: Live GLVM Contract logs & info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Protocol Info Board */}
          <div className="bg-black border border-indigo-500/20 rounded-xl p-5 text-right space-y-4 shadow-xl">
            <h3 className="text-sm font-mono uppercase tracking-wider text-indigo-400 font-bold border-b border-indigo-500/10 pb-2.5 flex items-center gap-2 justify-end">
              درباره پروتکل Genesis Proof
              <Network className="w-4 h-4 text-indigo-500" />
            </h3>
            
            <p className="text-[11px] text-indigo-500/80 leading-relaxed italic">
              قرارداد هوشمند هوشمند (Intelligent Contract) ما در GenLayer، آثار ثبت شده را از سه فیلتر قدرتمند اعتبارسنجی (AI Nodes) عبور می‌دهد تا احتمال وجود اثر کپی یا سرقت ادبی به حداقل برسد.
            </p>

            <div className="space-y-2 text-xs font-sans text-right">
              <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-sm">
                <strong className="text-indigo-400 block text-[11px] mb-1">🔍 Scholar AI (خزنده‌ی اینترنتی)</strong>
                <span className="text-[10px] text-indigo-500/70">بررسی همزمان پایگاه داده‌های برخط و مارکت‌پلیس‌ها برای تشخیص آثار مشابه پیشین.</span>
              </div>
              <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-sm">
                <strong className="text-indigo-400 block text-[11px] mb-1">⚖️ Legal Counsel AI (حقوقی و کپی‌رایت)</strong>
                <span className="text-[10px] text-indigo-500/70">ارزیابی مالکیت و مطابقت ادعا با استانداردهای مالکیت فکری جهانی (WIPO).</span>
              </div>
              <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-sm">
                <strong className="text-indigo-400 block text-[11px] mb-1">🎨 Industry Expert AI (تحلیل سبک هنری)</strong>
                <span className="text-[10px] text-indigo-500/70">بررسی ویژگی‌های بصری، متنی و تشخیص خودکار الگوهای تکراری یا کپی‌کاری شده.</span>
              </div>
            </div>
          </div>

          {/* Live GenLayer Virtual Machine (GLVM) Execution Logs Terminal */}
          <div className="bg-black border border-indigo-500/20 rounded-xl p-4 text-left font-mono text-[10px] space-y-3.5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="text-indigo-400 font-bold tracking-wider">GLVM TRANSACTION LEDGER</span>
              </div>
              <span className="text-indigo-400 font-bold uppercase font-mono text-[8px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-sm">
                دفتر کل تراکنش‌ها
              </span>
            </div>

            <p className="text-indigo-600/60 text-[9px] italic leading-relaxed text-right font-sans">
              تراکنش‌های به ثمر رسیده در گره شبیه‌ساز پس از رای‌گیری همزمان گره‌های هوشمند GenLayer.
            </p>

            <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1" dir="ltr">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-indigo-500/[0.05] pb-1.5 space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      log.type === 'SUCCESS' ? 'text-indigo-400' :
                      log.type === 'WARNING' ? 'text-indigo-500' :
                      log.type === 'ERROR' ? 'text-indigo-600' :
                      'text-indigo-400'
                    }`}>
                      [{log.method}]
                    </span>
                    <span className="text-indigo-600/40 text-[8px]">{log.txHash}</span>
                  </div>
                  <p className="text-indigo-500/90 leading-normal font-sans text-left">
                    {log.message}
                  </p>
                  <span className="text-[8px] text-indigo-600/40 block">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Interactive Transfer Ownership Modal */}
      {nftToTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-black border border-indigo-500/30 rounded-xl p-6 w-full max-w-sm text-right space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <h4 className="font-serif italic text-indigo-400 text-base">انتقال مالکیت اثر (Transfer NFT)</h4>
            <p className="text-xs text-indigo-500/80 leading-relaxed">
              شما در حال انتقال اثر "{nftToTransfer.title}" به آدرس دیگری در دفتر کل هستید.
            </p>
            <form onSubmit={handleTransferNft} className="space-y-4 text-right">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-indigo-500/80">آدرس مقصد (Target Address)</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={transferTargetAddress}
                  onChange={(e) => setTransferTargetAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-indigo-500/25 rounded-sm text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-400 text-left"
                  dir="ltr"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNftToTransfer(null);
                    setTransferTargetAddress('');
                  }}
                  className="px-3 py-1.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase cursor-pointer rounded-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase cursor-pointer shadow rounded-sm"
                >
                  تایید انتقال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modals and Overlays */}
      <AnimatePresence>
        {selectedNft && (
          <ConsensusVisualizer
            nft={selectedNft}
            onClose={() => setSelectedNft(null)}
          />
        )}
      </AnimatePresence>

      {/* Humble aesthetic footer */}
      <footer className="mt-12 border-t border-indigo-500/15 py-6 px-6 text-center text-indigo-600/55 font-mono text-[10px] space-y-1 bg-black">
        <p>Genesis Proof Protocol — 100% Client-Side Web Simulation of GenLayer Node Consensuses.</p>
        <p>No external third-party API dependencies. All calculations processed locally on-device.</p>
      </footer>

    </div>
  );
}
