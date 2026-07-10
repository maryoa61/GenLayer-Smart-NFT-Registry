import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Plus, Search, Cpu, RefreshCw, Sparkles, Filter, 
  User, Terminal, HelpCircle, History, ClipboardList, CheckCircle, 
  Copy, ExternalLink, Check, Send, Coins, ShoppingBag, Layers, 
  Settings, ArrowRight, ArrowDown, Shield, Info, CheckSquare
} from 'lucide-react';
import { NFT_Record } from './types';
import SubmitPatentForm from './components/SubmitPatentForm';
import ConsensusVisualizer from './components/ConsensusVisualizer';
import { translations } from './localization';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const t = translations[lang];

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
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({
    "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd": 14.25,
    "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a": 8.10,
    "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8": 45.00,
    "0x77ff81a299a9a30485aef901b007ea1221fbc44": 3.50
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedNft, setSelectedNft] = useState<NFT_Record | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Optimistic UI, caching, prefetching and throttling states
  const [pendingActions, setPendingActions] = useState<Record<string, 'LISTING' | 'BUYING' | 'TRANSFERRING' | 'AUDITING' | null>>({});
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [cooldownTimers, setCooldownTimers] = useState<Record<string, number>>({});
  const [prefetchedIds, setPrefetchedIds] = useState<Set<string>>(new Set());
  const [cacheHits, setCacheHits] = useState<Record<string, boolean>>({});

  // Listing / Marketplace Dialog state
  const [nftToList, setNftToList] = useState<NFT_Record | null>(null);
  const [listPrice, setListPrice] = useState('1.5');

  // Contract Upgrade / Configuration settings
  const [decayWeight, setDecayWeight] = useState(0.7); // Contract 2 decay weight
  const [platformFee, setPlatformFee] = useState(0); // Contract 3 platform fee

  // Selected Active Contract on Map for inspection
  const [selectedContractTab, setSelectedContractTab] = useState<'CONTRACT_1' | 'CONTRACT_2' | 'CONTRACT_3'>('CONTRACT_1');

  // Animation signal state when a contract is triggered
  const [lastTriggeredContract, setLastTriggeredContract] = useState<'CONTRACT_1' | 'CONTRACT_2' | 'CONTRACT_3' | null>(null);

  // Simulated live metrics
  const [blockHeight, setBlockHeight] = useState(842910);

  const [nftToTransfer, setNftToTransfer] = useState<NFT_Record | null>(null);
  const [transferTargetAddress, setTransferTargetAddress] = useState('');

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

  // Cooldown countdown manager
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownTimers(prev => {
        const updated: Record<string, number> = {};
        let hasActive = false;
        Object.entries(cooldowns).forEach(([tokenId, expireAt]) => {
          const diff = Math.ceil(((expireAt as number) - Date.now()) / 1000);
          if (diff > 0) {
            updated[tokenId] = diff;
            hasActive = true;
          }
        });
        return hasActive ? updated : {};
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldowns]);

  // Fetch full state from backend (Cache-Aside pattern)
  const fetchData = async () => {
    try {
      // 1. Fetch NFTs from Registry (Contract 1)
      const nftsRes = await fetch('/api/nfts');
      const nftsData = await nftsRes.json();
      
      if (Array.isArray(nftsData)) {
        let loggedHit = false;
        let loggedMiss = false;

        const mergedNfts = nftsData.map((nft: NFT_Record) => {
          const cacheKey = `genesis_meta_cache_${nft.token_id}`;
          const cachedString = localStorage.getItem(cacheKey);

          if (cachedString) {
            try {
              const cachedMeta = JSON.parse(cachedString);
              setCacheHits(prev => ({ ...prev, [nft.token_id]: true }));
              
              if (!loggedHit) {
                addLogLocal("REGISTRY_CACHE", `Cache-Aside HIT: Loaded static metadata (title, category, media) from localStorage cache for Token #${nft.token_id}. Saved network bandwidth and GenLayer RPC load!`, "SUCCESS");
                loggedHit = true;
              }

              return {
                ...nft,
                title: cachedMeta.title || nft.title,
                description: cachedMeta.description || nft.description,
                category: cachedMeta.category || nft.category,
                creator: cachedMeta.creator || nft.creator,
                media_url: cachedMeta.media_url || nft.media_url,
                minted_at: cachedMeta.minted_at || nft.minted_at,
              };
            } catch (err) {
              console.error("Failed to parse static metadata cache for token id:", nft.token_id);
            }
          }

          // Cache-Aside Miss: write static metadata to cache
          const staticMeta = {
            title: nft.title,
            description: nft.description,
            category: nft.category,
            creator: nft.creator,
            media_url: nft.media_url,
            minted_at: nft.minted_at
          };
          localStorage.setItem(cacheKey, JSON.stringify(staticMeta));
          setCacheHits(prev => ({ ...prev, [nft.token_id]: false }));

          if (!loggedMiss) {
            addLogLocal("REGISTRY_CACHE", `Cache-Aside MISS: Static metadata for Token #${nft.token_id} requested from VM Registry and cached.`, "WARNING");
            loggedMiss = true;
          }

          return nft;
        });

        setNfts(mergedNfts);
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

  const handleRegisterSuccess = async () => {
    triggerContractFlash('CONTRACT_1');
    await fetchData();
    setShowSubmitForm(false);
  };

  const triggerContractFlash = (contract: 'CONTRACT_1' | 'CONTRACT_2' | 'CONTRACT_3') => {
    setLastTriggeredContract(contract);
    setSelectedContractTab(contract);
    setTimeout(() => {
      setLastTriggeredContract(null);
    }, 2500);
  };

  const handlePrefetchNft = (tokenId: string) => {
    if (prefetchedIds.has(tokenId)) return;
    setPrefetchedIds(prev => {
      const next = new Set(prev);
      next.add(tokenId);
      return next;
    });

    addLogLocal("PREFETCH_OPTIMIZATION", `Prefetch on Hover: Preloaded dynamic details for Token #${tokenId} from marketplace ledger in background. Zero click delay!`, "INFO");
  };

  const handleAuditProvenance = async (tokenId: string) => {
    if (cooldownTimers[tokenId]) {
      alert(lang === 'fa' ? `محدودیت زمانی فعال است! لطفا ${cooldownTimers[tokenId]} ثانیه صبر کنید.` : `Cooldown active! Please wait ${cooldownTimers[tokenId]}s.`);
      return;
    }

    const cost = 0.05;
    const currentBalance = walletBalances[currentWallet.address] || 0;
    if (currentBalance < cost) {
      alert(lang === 'fa' ? `موجودی GETH ناکافی است! کارمزد گاز حسابرسی مجدد ${cost} GETH است، اما شما فقط ${currentBalance} GETH دارید.` : `Insufficient GETH! Re-audit gas fee is ${cost} GETH, but you only have ${currentBalance} GETH.`);
      return;
    }

    // Optimistic UI state updates
    setPendingActions(prev => ({ ...prev, [tokenId]: 'AUDITING' }));
    
    // Optimistic gas fee deduction
    setWalletBalances(prev => ({
      ...prev,
      [currentWallet.address]: Number((prev[currentWallet.address] - cost).toFixed(4))
    }));

    triggerContractFlash('CONTRACT_2');
    setIsLoading(true);

    addLogLocal("CONTRACT_2:RE_AUDIT_PENDING", `Optimistic consensus dispatch initiated for Token #${tokenId}. Charging ${cost} GETH gas.`, 'INFO');

    try {
      const res = await fetch('/api/nfts/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          caller: currentWallet.address,
          decay_weight: decayWeight // Showcasing parameter orchestration!
        })
      });
      
      // Set cooldown on successful triggering
      setCooldowns(prev => ({ ...prev, [tokenId]: Date.now() + 30000 }));
      
      // Event-driven simulated notification
      addLogLocal("WEB3_EVENT:AUDIT_COMPLETED", `Real-time Event Captured: AuditCompleted(tokenId: ${tokenId}) from Contract 2. Viewport synced!`, 'SUCCESS');
      
      await fetchData();
    } catch (err) {
      console.error("Error auditing NFT:", err);
      // Revert fee on failure
      setWalletBalances(prev => ({
        ...prev,
        [currentWallet.address]: Number((prev[currentWallet.address] + cost).toFixed(4))
      }));
    } finally {
      setIsLoading(false);
      setPendingActions(prev => ({ ...prev, [tokenId]: null }));
    }
  };

  const handleListNft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftToList || !listPrice) return;

    const tokenId = nftToList.token_id;
    const priceNum = Number(listPrice);

    // Keep backup for reversion
    const originalNfts = [...nfts];

    // Optimistic UI update: instantly update list state and price in local UI
    setNfts(prev => prev.map(item => {
      if (item.token_id === tokenId) {
        return { ...item, is_listed: true, price: priceNum };
      }
      return item;
    }));

    setPendingActions(prev => ({ ...prev, [tokenId]: 'LISTING' }));
    setNftToList(null);
    triggerContractFlash('CONTRACT_3');

    addLogLocal("CONTRACT_3:LISTING_PENDING", `Optimistic UI: Listing Token #${tokenId} on the marketplace for ${priceNum} GETH. Waiting for VM confirmation...`, 'INFO');

    try {
      const res = await fetch('/api/nfts/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          price: priceNum,
          caller: currentWallet.address
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        // Revert on failure
        setNfts(originalNfts);
      } else {
        // Event-driven simulated notification
        addLogLocal("WEB3_EVENT:LISTING_ACTIVE", `Real-time Event Captured: ListingActive(tokenId: ${tokenId}, price: ${priceNum} GETH) from Contract 3. Viewport synced!`, 'SUCCESS');
        await fetchData();
      }
    } catch (err) {
      console.error("Error listing NFT:", err);
      setNfts(originalNfts);
    } finally {
      setPendingActions(prev => ({ ...prev, [tokenId]: null }));
    }
  };

  const handleBuyNft = async (nft: NFT_Record) => {
    const tokenId = nft.token_id;
    const currentBalance = walletBalances[currentWallet.address] || 0;
    const price = nft.price || 0;

    if (currentBalance < price) {
      alert(`Insufficient funds! NFT price is ${price} GETH, but you only have ${currentBalance} GETH.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to buy "${nft.title}" for ${price} GETH?\nThis will split royalties to the original creator (${nft.royalty_percentage}%) automatically on Contract 3.`)) {
      return;
    }

    // Keep backups
    const originalNfts = [...nfts];
    const originalBalances = { ...walletBalances };

    // Optimistic state updates
    setNfts(prev => prev.map(item => {
      if (item.token_id === tokenId) {
        return { ...item, owner: currentWallet.address, is_listed: false };
      }
      return item;
    }));
    
    setPendingActions(prev => ({ ...prev, [tokenId]: 'BUYING' }));
    triggerContractFlash('CONTRACT_3');
    setIsLoading(true);

    addLogLocal("CONTRACT_3:BUY_PENDING", `Optimistic UI: Buying Token #${tokenId} for ${price} GETH. Waiting for VM split validation...`, 'INFO');

    try {
      const res = await fetch('/api/nfts/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          caller: currentWallet.address
        })
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        // Revert
        setNfts(originalNfts);
        setWalletBalances(originalBalances);
      } else {
        // Update mock balances in frontend securely
        const buyerAddr = currentWallet.address;
        const sellerAddr = data.split.seller;
        const creatorAddr = data.split.creator;
        const royaltyAmt = data.split.royaltyAmount;
        const remainderAmt = data.split.sellerRemainder;

        setWalletBalances(prev => {
          const updated = { ...prev };
          // Deduct full price from buyer
          updated[buyerAddr] = Number((updated[buyerAddr] - price).toFixed(4));
          // Add remainder to seller
          updated[sellerAddr] = Number(((updated[sellerAddr] || 0) + remainderAmt).toFixed(4));
          // Add royalty to creator
          updated[creatorAddr] = Number(((updated[creatorAddr] || 0) + royaltyAmt).toFixed(4));
          return updated;
        });

        // Event-driven simulated notification
        addLogLocal("WEB3_EVENT:TRANSACTION_FINALIZED", `Real-time Event Captured: PurchaseFinalized(tokenId: ${tokenId}, buyer: ${buyerAddr.slice(0,6)}...) from Contract 3. Viewport synced!`, 'SUCCESS');

        alert(`Purchase Successful!\nPaid: ${price} GETH\n- Creator Royalty: ${royaltyAmt} GETH sent to ${creatorAddr.slice(0, 8)}...\n- Seller share: ${remainderAmt} GETH sent to ${sellerAddr.slice(0, 8)}...`);
        await fetchData();
      }
    } catch (err) {
      console.error("Error purchasing NFT:", err);
      setNfts(originalNfts);
      setWalletBalances(originalBalances);
    } finally {
      setIsLoading(false);
      setPendingActions(prev => ({ ...prev, [tokenId]: null }));
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
    <div className="min-h-screen bg-black text-slate-200 flex flex-col font-sans relative overflow-x-hidden antialiased" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
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
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif italic text-indigo-400 tracking-tight font-bold">{t.title}</h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-sm">
                  {t.subtitle}
                </span>
              </div>
              <p className="text-[11px] text-indigo-500/80 font-sans tracking-wide">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* User Wallet & Language Control (Simulation) */}
          <div className="flex flex-wrap items-center gap-3.5 bg-indigo-500/[0.02] border border-indigo-500/20 p-2 rounded-sm max-w-full">
            {/* Language Switcher Button */}
            <button
              onClick={() => {
                const nextLang = lang === 'fa' ? 'en' : 'fa';
                setLang(nextLang);
                addLogLocal("LOCALE_CHANGED", `Language context switched to ${nextLang === 'fa' ? 'Persian (فارسی)' : 'English'}`, "INFO");
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 text-xs rounded-sm hover:bg-indigo-500/25 transition-all cursor-pointer font-bold font-mono"
            >
              <span>🌐</span>
              <span>{lang === 'fa' ? 'English (EN)' : 'فارسی (FA)'}</span>
            </button>

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
                <span className="text-[9px] text-indigo-600/70 uppercase block leading-none">{lang === 'fa' ? 'موجودی' : 'Balance'}</span>
                <span className="text-indigo-400 font-bold">{(walletBalances[currentWallet.address] || 0).toFixed(2)} GETH</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Live Sandbox Metrics Banner */}
      <section className="bg-black border-b border-indigo-500/10 py-3.5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left font-mono text-[11px]">
          <div className="space-y-0.5">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">{t.blockHeight}</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1.5 justify-start" dir="ltr">
              <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
              {blockHeight}
            </span>
          </div>
          <div className="space-y-0.5 border-l border-indigo-500/10 pl-4 pr-4">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">{t.architecture}</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1 justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 ml-1" />
              Layered Multi-Contract
            </span>
          </div>
          <div className="space-y-0.5 border-l border-indigo-500/10 pl-4 pr-4">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">{t.upgradability}</span>
            <span className="text-indigo-400 font-bold text-emerald-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Isolated / Modular
            </span>
          </div>
          <div className="space-y-0.5 border-l border-indigo-500/10 pl-4 pr-4">
            <span className="text-indigo-600/70 block text-[9px] tracking-wider">{t.activeContracts}</span>
            <span className="text-indigo-400 font-bold">3 Operational</span>
          </div>
        </div>
      </section>

      {/* THREE-CONTRACT LAYERED ORCHESTRATOR BOARD */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-b from-indigo-950/10 to-black border border-indigo-500/25 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-indigo-600/50 uppercase">
            Control Room v2.4
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/15 pb-4 mb-5">
            <div className="text-left">
              <h2 className="text-sm font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {t.contractUpgradeInfo}
              </h2>
              <p className="text-xs text-indigo-500/70 mt-1">
                {t.modularArchDesc}
              </p>
            </div>
          </div>

          {/* Stream Map Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Map Column */}
            <div className="lg:col-span-8 flex flex-col justify-between border border-indigo-500/10 bg-black/60 p-5 rounded-xl relative">
              {/* Orchestrator node */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs font-mono text-indigo-300 font-bold shadow-lg">
                  <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
                  App Client (Genesis Proof Orchestrator)
                </div>
                <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500/30 to-indigo-500/10 border-dashed" />
              </div>

              {/* Three contracts grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Contract 1 */}
                <div 
                  onClick={() => setSelectedContractTab('CONTRACT_1')}
                  className={`border p-4 rounded-xl text-left cursor-pointer transition-all duration-300 relative ${
                    selectedContractTab === 'CONTRACT_1' 
                      ? 'border-indigo-400 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'border-indigo-500/15 bg-black/40 hover:border-indigo-500/40'
                  } ${lastTriggeredContract === 'CONTRACT_1' ? 'ring-2 ring-emerald-500 animate-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">CONTRACT 1</span>
                    <span className={`w-2 h-2 rounded-full ${lastTriggeredContract === 'CONTRACT_1' ? 'bg-emerald-400 animate-ping' : 'bg-indigo-500'}`} />
                  </div>
                  <h3 className="text-xs font-serif italic text-indigo-200 mb-1">{t.contract1Name}</h3>
                  <p className="text-[10px] text-indigo-500/70 leading-relaxed mb-3">
                    {t.registryDesc}
                  </p>
                  <div className="text-[9px] font-mono text-indigo-500 truncate" dir="ltr">
                    0x7a8eEa...712C2a
                  </div>
                </div>

                {/* Contract 2 */}
                <div 
                  onClick={() => setSelectedContractTab('CONTRACT_2')}
                  className={`border p-4 rounded-xl text-left cursor-pointer transition-all duration-300 relative ${
                    selectedContractTab === 'CONTRACT_2' 
                      ? 'border-indigo-400 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'border-indigo-500/15 bg-black/40 hover:border-indigo-500/40'
                  } ${lastTriggeredContract === 'CONTRACT_2' ? 'ring-2 ring-emerald-500 animate-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">CONTRACT 2</span>
                    <span className={`w-2 h-2 rounded-full ${lastTriggeredContract === 'CONTRACT_2' ? 'bg-emerald-400 animate-ping' : 'bg-indigo-500'}`} />
                  </div>
                  <h3 className="text-xs font-serif italic text-indigo-200 mb-1">{t.contract2Name}</h3>
                  <p className="text-[10px] text-indigo-500/70 leading-relaxed mb-3">
                    {t.auditDesc}
                  </p>
                  <div className="text-[9px] font-mono text-indigo-500 truncate" dir="ltr">
                    0x32A5b9...d1E842
                  </div>
                </div>

                {/* Contract 3 */}
                <div 
                  onClick={() => setSelectedContractTab('CONTRACT_3')}
                  className={`border p-4 rounded-xl text-left cursor-pointer transition-all duration-300 relative ${
                    selectedContractTab === 'CONTRACT_3' 
                      ? 'border-indigo-400 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'border-indigo-500/15 bg-black/40 hover:border-indigo-500/40'
                  } ${lastTriggeredContract === 'CONTRACT_3' ? 'ring-2 ring-emerald-500 animate-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">CONTRACT 3</span>
                    <span className={`w-2 h-2 rounded-full ${lastTriggeredContract === 'CONTRACT_3' ? 'bg-emerald-400 animate-ping' : 'bg-indigo-500'}`} />
                  </div>
                  <h3 className="text-xs font-serif italic text-indigo-200 mb-1">{t.contract3Name}</h3>
                  <p className="text-[10px] text-indigo-500/70 leading-relaxed mb-3">
                    {t.marketplaceDesc}
                  </p>
                  <div className="text-[9px] font-mono text-indigo-500 truncate" dir="ltr">
                    0x4A7b99...1D31Cd
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Interactive Configuration Side Column */}
            <div className="lg:col-span-4 border border-indigo-500/15 bg-black p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-indigo-500/10 pb-2 mb-3">
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-mono text-indigo-300 uppercase font-bold">{t.contractDetails}</span>
                </div>

                {/* Contract Tab View */}
                {selectedContractTab === 'CONTRACT_1' && (
                  <div className="space-y-3.5 text-left text-xs">
                    <h4 className="font-bold text-indigo-200 font-serif italic">{t.contract1Name}</h4>
                    <p className="text-[11px] text-indigo-500/80 leading-relaxed">
                      Secures original authorship metadata. It is highly optimized to protect basic mint variables and prevents storage/memory overhead during registration.
                    </p>
                    <div className="bg-indigo-950/15 border border-indigo-500/10 p-3 rounded-sm space-y-2 text-[10px] font-mono text-indigo-400" dir="ltr">
                      <div><span className="text-indigo-600">Base Mint Fee:</span> 0.05 GETH</div>
                      <div><span className="text-indigo-600">DB Schema:</span> TokenRegistryV1</div>
                      <div><span className="text-indigo-600">AI Nodes:</span> 3 Active (Scholar, Legal, Art)</div>
                    </div>
                  </div>
                )}

                {selectedContractTab === 'CONTRACT_2' && (
                  <div className="space-y-3.5 text-left text-xs">
                    <h4 className="font-bold text-indigo-200 font-serif italic">{t.contract2Name}</h4>
                    <p className="text-[11px] text-indigo-500/80 leading-relaxed">
                      Calculates the mathematical scoring algorithms. Because this logic is isolated, you can change the formula weight below instantly without touching your NFT registry!
                    </p>
                    
                    {/* Interactive Slider to Tune mathematical trust decay */}
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-sm space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400">
                        <span>{t.decayCoef}</span>
                        <span className="text-indigo-300 font-bold">{decayWeight * 100}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="0.9" 
                        step="0.05" 
                        value={decayWeight} 
                        onChange={(e) => {
                          setDecayWeight(Number(e.target.value));
                          addLogLocal("CONTRACT_UPGRADE", `Contract 2 (Audit) re-calibrated: decay coefficient λ set to ${e.target.value}. Core Registry unaffected.`, "WARNING");
                        }}
                        className="w-full accent-indigo-500 cursor-pointer h-1" 
                      />
                      <p className="text-[9px] text-indigo-600 leading-normal font-sans italic">
                        Formula: DecayedScore = (PreviousScore * {Number((1 - decayWeight * 0.43).toFixed(2))}) + (LatestAudit * {Number((decayWeight * 0.43).toFixed(2))})
                      </p>
                    </div>
                  </div>
                )}

                {selectedContractTab === 'CONTRACT_3' && (
                  <div className="space-y-3.5 text-left text-xs">
                    <h4 className="font-bold text-indigo-200 font-serif italic">{t.contract3Name}</h4>
                    <p className="text-[11px] text-indigo-500/80 leading-relaxed">
                      Processes listings, purchases, and manages royalty transfers. High financial processing volumes are completely sandboxed here, saving protocol resources.
                    </p>
                    
                    {/* Platform Fee Configurator */}
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-sm space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400">
                        <span>{t.protocolFee}</span>
                        <span className="text-emerald-400 font-bold">{platformFee}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5" 
                        value={platformFee} 
                        onChange={(e) => {
                          setPlatformFee(Number(e.target.value));
                          addLogLocal("MARKET_UPGRADE", `Contract 3 (Marketplace) parameters tuned: protocol trade fee set to ${e.target.value}%.`, "INFO");
                        }}
                        className="w-full accent-indigo-500 cursor-pointer h-1" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-center justify-between text-[10px] font-mono text-indigo-500">
                <span>{t.synced}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t.live}</span>
              </div>
            </div>
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
                  lang={lang}
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
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-indigo-400 placeholder-indigo-800/60 focus:outline-none text-left"
                    />
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-black border border-indigo-500/20 text-xs text-indigo-400 px-3 py-2 rounded-sm focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="ALL">{t.allCategories}</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Photography">Photography</option>
                      <option value="Music">Music</option>
                      <option value="3D Model">3D Model</option>
                      <option value="Text/Literary">Text/Literary</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-black border border-indigo-500/20 text-xs text-indigo-400 px-3 py-2 rounded-sm focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="ALL">{t.allStatuses}</option>
                      <option value="VERIFIED_ORIGINAL">Verified Original</option>
                      <option value="PROBABLE_ORIGINAL">Probable Original</option>
                      <option value="DISPUTED">Disputed</option>
                    </select>

                    <button
                      onClick={() => setShowSubmitForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] transition-all rounded-sm text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-500/10 animate-pulse-slow"
                    >
                      <Plus className="w-4 h-4" /> {t.registerBtn}
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
                          onMouseEnter={() => handlePrefetchNft(nft.token_id)}
                          className="bg-black border border-indigo-500/20 rounded-xl overflow-hidden hover:border-indigo-400 transition-all flex flex-col h-full group relative shadow-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] text-left"
                        >
                          {/* Optimistic Pending Action Loader Overlay */}
                          {pendingActions[nft.token_id] && (
                            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center space-y-3">
                              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-sm flex items-center gap-1.5 animate-pulse">
                                <span>●</span> {t.pendingText}
                              </span>
                              <p className="text-xs text-indigo-200 font-sans leading-relaxed">
                                {pendingActions[nft.token_id] === 'LISTING' ? t.optimisticListing :
                                 pendingActions[nft.token_id] === 'BUYING' ? t.optimisticBuying :
                                 pendingActions[nft.token_id] === 'TRANSFERRING' ? t.optimisticTransferring :
                                 pendingActions[nft.token_id] === 'AUDITING' ? t.optimisticAuditing : ''}
                              </p>
                            </div>
                          )}

                          {/* Top Status Tags */}
                          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
                            <span className="bg-black/90 backdrop-blur-md border border-indigo-500/20 text-[9px] font-mono text-indigo-400 px-2.5 py-0.5 rounded-sm uppercase font-bold">
                              {nft.category}
                            </span>
                            {/* Cache-Aside Indicator */}
                            {cacheHits[nft.token_id] !== undefined && (
                              <span className={`bg-black/90 backdrop-blur-md border text-[8px] font-mono px-2 py-0.5 rounded-sm uppercase font-bold ${
                                cacheHits[nft.token_id]
                                  ? 'border-emerald-500/30 text-emerald-400'
                                  : 'border-amber-500/30 text-amber-500'
                              }`}>
                                {cacheHits[nft.token_id] ? t.cacheHitText : t.cacheMissText}
                              </span>
                            )}
                            {/* Prefetched Indicator */}
                            {prefetchedIds.has(nft.token_id) && (
                              <span className="bg-black/90 backdrop-blur-md border border-emerald-500/30 text-[8px] font-mono text-emerald-400 px-2 py-0.5 rounded-sm uppercase font-bold flex items-center gap-1 animate-pulse">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                {t.prefetchText}
                              </span>
                            )}
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
                              <div className="flex flex-col gap-1 text-left w-full">
                                <h3 className="text-base font-serif italic text-indigo-200 leading-tight drop-shadow-md bg-black/85 px-2 py-1 rounded-sm w-fit">
                                  {nft.title}
                                </h3>
                                {/* List Price Badge */}
                                {nft.is_listed && (
                                  <span className="text-[10px] font-mono font-bold bg-emerald-500/90 text-black px-2 py-0.5 rounded-sm w-fit shadow">
                                    FOR SALE: {nft.price} GETH
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Content info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2 text-left">
                              <p className="text-xs text-indigo-500/85 leading-relaxed line-clamp-2 italic">
                                "{nft.description}"
                              </p>

                              {/* Owner & Creator addresses */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-indigo-600 pt-1.5 border-t border-indigo-500/10" dir="ltr">
                                <div>
                                  <span className="block text-[8px] text-indigo-600/50 uppercase">Creator & Royalty</span>
                                  <span className="text-indigo-400 truncate block">
                                    {nft.creator.slice(0,6)}...{nft.creator.slice(-4)} ({nft.royalty_percentage || 10}%)
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-indigo-600/50 uppercase">Current Owner</span>
                                  <span className="text-indigo-400 truncate block font-bold">
                                    {isOwner ? "YOU" : `${nft.owner.slice(0,6)}...${nft.owner.slice(-4)}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Score & Progress Bar */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-indigo-500/80 text-[10px]">{t.authenticityConfidence}</span>
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
                                {t.reviewConsensus}
                              </button>

                              <button
                                onClick={() => handleAuditProvenance(nft.token_id)}
                                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-black hover:bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 rounded-sm text-[9px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                                disabled={isLoading || !!cooldownTimers[nft.token_id]}
                                title="Re-run mathematical decay and crawler analysis (Contract 2)"
                              >
                                <div className="flex items-center gap-1">
                                  {cooldownTimers[nft.token_id] ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
                                      <span>{cooldownTimers[nft.token_id]}s {t.cooldownText}</span>
                                    </>
                                  ) : (
                                    <>
                                      <History className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>{t.reAudit}</span>
                                    </>
                                  )}
                                </div>
                                <span className="text-[7px] text-indigo-600 font-mono tracking-normal leading-none block">{t.reAuditFeeWarn}</span>
                              </button>

                              {isOwner ? (
                                <div className="grid grid-cols-2 gap-1 col-span-1">
                                  <button
                                    onClick={() => setNftToList(nft)}
                                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 rounded-sm text-[9px] font-bold uppercase transition-all cursor-pointer"
                                    title="List this patent for sale on the marketplace (Contract 3)"
                                  >
                                    <ShoppingBag className="w-3 h-3 text-emerald-500" />
                                    {t.sellBtn}
                                  </button>
                                  <button
                                    onClick={() => setNftToTransfer(nft)}
                                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-950/20 hover:bg-indigo-950/30 text-indigo-400 border border-indigo-500/20 rounded-sm text-[9px] font-bold uppercase transition-all cursor-pointer"
                                    title="Manually transfer ownership address"
                                  >
                                    <Send className="w-3 h-3 text-indigo-500" />
                                    {t.sendBtn}
                                  </button>
                                </div>
                              ) : nft.is_listed ? (
                                <button
                                  onClick={() => handleBuyNft(nft)}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-500/30 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                                  title="Purchase ownership with instant royalty payout split (Contract 3)"
                                >
                                  <Coins className="w-3.5 h-3.5 text-black" />
                                  {t.buyBtn}: {nft.price} GETH
                                </button>
                              ) : (
                                <div className="text-center py-1.5 text-[9px] text-indigo-600/50 uppercase font-mono border border-indigo-500/5 bg-black rounded-sm flex items-center justify-center">
                                  {t.privateAsset}
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
                      <p className="text-xs">No matching NFTs found.</p>
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
          <div className="bg-black border border-indigo-500/20 rounded-xl p-5 text-left space-y-4 shadow-xl">
            <h3 className="text-sm font-mono uppercase tracking-wider text-indigo-400 font-bold border-b border-indigo-500/10 pb-2.5 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-500" />
              {t.layeredScience}
            </h3>
            
            <p className="text-[11px] text-indigo-500/80 leading-relaxed italic text-left">
              {t.layeredScienceDesc}
            </p>

            <div className="space-y-2 text-[11px] font-sans text-left">
              <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-sm">
                <strong className="text-indigo-400 block text-[10px] mb-1">🛡️ {t.contract1Name}</strong>
                <span className="text-[10px] text-indigo-500/70">{t.contract1Desc}</span>
              </div>
              <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-sm">
                <strong className="text-indigo-400 block text-[10px] mb-1">⚖️ {t.contract2Name}</strong>
                <span className="text-[10px] text-indigo-500/70">{t.contract2Desc}</span>
              </div>
              <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-sm">
                <strong className="text-indigo-400 block text-[10px] mb-1">💰 {t.contract3Name}</strong>
                <span className="text-[10px] text-indigo-500/70">{t.contract3Desc}</span>
              </div>
            </div>
          </div>

          {/* Live GenLayer Virtual Machine (GLVM) Execution Logs Terminal */}
          <div className="bg-black border border-indigo-500/20 rounded-xl p-4 text-left font-mono text-[10px] space-y-3.5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="text-indigo-400 font-bold tracking-wider">{t.ledgerTitle}</span>
              </div>
              <span className="text-indigo-400 font-bold uppercase font-mono text-[8px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-sm">
                Live Consensus
              </span>
            </div>

            <p className="text-indigo-600/60 text-[9px] italic leading-relaxed text-left font-sans">
              {t.ledgerDesc}
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

      {/* Interactive List NFT for Sale Modal (Contract 3) */}
      {nftToList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-black border border-indigo-500/30 rounded-xl p-6 w-full max-w-sm text-left space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <h4 className="font-serif italic text-indigo-400 text-base">{t.listAssetTitle}</h4>
            <p className="text-xs text-indigo-500/80 leading-relaxed">
              {lang === 'fa' ? `شما در حال ثبت دارایی "${nftToList.title}" برای فروش هستید. خریداران این دارایی را از طریق قرارداد ۳ تهیه می‌کنند و حق امتیاز ${nftToList.royalty_percentage}٪ به طور خودکار به سازنده اثر منتقل می‌شود.` : `You are listing "${nftToList.title}" on the market. Buyers will purchase this asset via Contract 3, and a royalty of ${nftToList.royalty_percentage}% will automatically transfer to creator ${nftToList.creator.slice(0, 6)}... on checkout.`}
            </p>
            <form onSubmit={handleListNft} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-indigo-500/80">{t.listPriceLabel}</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-indigo-500/25 rounded-sm text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-400 text-left"
                  dir="ltr"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNftToList(null);
                  }}
                  className="px-3 py-1.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase cursor-pointer rounded-sm"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[10px] uppercase cursor-pointer shadow rounded-sm"
                >
                  {t.publishListingBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Transfer Ownership Modal */}
      {nftToTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-black border border-indigo-500/30 rounded-xl p-6 w-full max-w-sm text-left space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <h4 className="font-serif italic text-indigo-400 text-base">{t.transferTitle}</h4>
            <p className="text-xs text-indigo-500/80 leading-relaxed">
              {lang === 'fa' ? `شما در حال انتقال مستقیم مالکیت دارایی "${nftToTransfer.title}" به آدرس جدید در دفترکل جن لایر هستید.` : `You are transferring the ownership of "${nftToTransfer.title}" to another address on the ledger.`}
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTransferNft(e);
            }} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-indigo-500/80">{t.transferTargetLabel}</label>
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
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase cursor-pointer shadow rounded-sm"
                >
                  {t.confirmTransferBtn}
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
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Humble aesthetic footer */}
      <footer className="mt-12 border-t border-indigo-500/15 py-6 px-6 text-center text-indigo-600/55 font-mono text-[10px] space-y-1 bg-black">
        <p>{lang === 'fa' ? 'پروتکل اثبات جنسیس (Genesis Proof) — شبیه‌ساز قراردادهای لایه‌بندی شده در حال اجرا روی ماشین مجازی جن‌لایر (GenLayer VM).' : 'Genesis Proof Protocol — Layered Contract Simulator executing on GenLayer VM.'}</p>
        <p>{lang === 'fa' ? 'ثبت دارایی مجزا، ارزیابی امتیازدهی اجماع هوش مصنوعی، و محدودیت‌های اقتصادی بازار در بستر وب۳.' : 'Separated Registry, scoring evaluation, and economic marketplace constraints.'}</p>
      </footer>

    </div>
  );

  // Core handler helper (inline)
  async function handleTransferNft(e: React.FormEvent) {
    if (!nftToTransfer || !transferTargetAddress) return;

    const tokenId = nftToTransfer.token_id;
    const target = transferTargetAddress;

    // Keep backup
    const originalNfts = [...nfts];

    // Optimistic state updates
    setNfts(prev => prev.map(item => {
      if (item.token_id === tokenId) {
        return { ...item, owner: target, is_listed: false };
      }
      return item;
    }));

    setPendingActions(prev => ({ ...prev, [tokenId]: 'TRANSFERRING' }));
    setNftToTransfer(null);
    setTransferTargetAddress('');

    addLogLocal("CONTRACT_1:TRANSFER_PENDING", `Optimistic UI: Transferring Token #${tokenId} to ${target.slice(0,8)}... Waiting for ledger validation...`, 'INFO');

    try {
      const res = await fetch('/api/nfts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          to: target,
          caller: currentWallet.address
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setNfts(originalNfts);
      } else {
        // Event-driven simulated notification
        addLogLocal("WEB3_EVENT:TRANSFER", `Real-time Event Captured: Transfer(tokenId: ${tokenId}, from: ${currentWallet.address.slice(0,6)}..., to: ${target.slice(0,6)}...) from Contract 1. Viewport synced!`, 'SUCCESS');
        alert(`Transfer successful! NFT #${tokenId} has been transferred to address ${target}.`);
        await fetchData();
      }
    } catch (err) {
      console.error("Error transferring NFT:", err);
      setNfts(originalNfts);
    } finally {
      setPendingActions(prev => ({ ...prev, [tokenId]: null }));
    }
  }
}
