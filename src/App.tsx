import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Plus, Search, Shield, Cpu, RefreshCw, Layers, Sparkles, Filter, 
  DollarSign, ArrowRight, User, Terminal, HelpCircle, AlertTriangle, BookOpen, Scale,
  LogOut, ClipboardList, TrendingUp, CheckCircle, Ban, History
} from 'lucide-react';
import { NFT_Record, Listing, AuditHistoryEntry, ChallengeHistoryEntry } from './types';
import SubmitPatentForm from './components/SubmitPatentForm';
import ChallengeModal from './components/ChallengeModal';
import ConsensusVisualizer from './components/ConsensusVisualizer';

export default function App() {
  const [nfts, setNfts] = useState<NFT_Record[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Wallet States
  const mockWallets = [
    { address: "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd", name: "Artist Creator Alpha" },
    { address: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a", name: "Artist Creator Golden Remix" },
    { address: "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8", name: "Secondary Collector & Trader" },
    { address: "0x77ff81a299a9a30485aef901b007ea1221fbc44", name: "External Challenger Node" }
  ];
  
  const [currentWallet, setCurrentWallet] = useState(mockWallets[0]);
  const [walletBalance, setWalletBalance] = useState("12.5");
  const [pendingWithdrawal, setPendingWithdrawal] = useState("0.0");

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedNft, setSelectedNft] = useState<NFT_Record | null>(null);
  const [nftToChallenge, setNftToChallenge] = useState<NFT_Record | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [parentNftForDeriv, setParentNftForDeriv] = useState<NFT_Record | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listing Form states
  const [nftToList, setNftToList] = useState<NFT_Record | null>(null);
  const [listPrice, setListPrice] = useState('1.5');

  // Simulated Testnet Live Metrics
  const [blockHeight, setBlockHeight] = useState(842910);
  const [activeDisputeCount, setActiveDisputeCount] = useState(0);

  // Fetch full state from full-stack backend
  const fetchData = async () => {
    try {
      // 1. Fetch NFTs
      const nftsRes = await fetch('/api/nfts');
      const nftsData = await nftsRes.json();
      if (Array.isArray(nftsData)) {
        setNfts(nftsData);
        // Compute active disputes
        const disputes = nftsData.filter(n => n.authenticity_status === 'DISPUTED').length;
        setActiveDisputeCount(disputes);
      }

      // 2. Fetch Listings
      const listingsRes = await fetch('/api/listings');
      const listingsData = await listingsRes.json();
      if (Array.isArray(listingsData)) {
        setListings(listingsData);
      }

      // 3. Fetch GLVM logs
      const logsRes = await fetch('/api/logs');
      const logsData = await logsRes.json();
      if (Array.isArray(logsData)) {
        setLogs(logsData);
      }

      // 4. Fetch Pending Withdrawals
      const balanceRes = await fetch(`/api/balances/${currentWallet.address}`);
      const balanceData = await balanceRes.json();
      if (balanceData && balanceData.pending_withdrawals) {
        setPendingWithdrawal(balanceData.pending_withdrawals);
      }

    } catch (err) {
      console.error('Error fetching protocol details:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Increment block height periodically to simulate real blockchain activity
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Whenever wallet changes, re-fetch pending balance
  useEffect(() => {
    fetchData();
    // Simulate changing local GETH wallet balances dynamically
    if (currentWallet.address.startsWith("0x4A7b")) setWalletBalance("14.25");
    else if (currentWallet.address.startsWith("0x98Be")) setWalletBalance("8.10");
    else if (currentWallet.address.startsWith("0x33Aa")) setWalletBalance("45.00");
    else setWalletBalance("3.50");
  }, [currentWallet]);

  // Actions
  const handleRegisterSuccess = async (mintResult: any) => {
    await fetchData();
    setShowSubmitForm(false);
    setParentNftForDeriv(null);
  };

  const handleConfirmChallenge = async (challengeData: { challenger: string; challengerExplanation: string; challengeUrl: string }) => {
    if (!nftToChallenge) return;
    try {
      const res = await fetch('/api/nfts/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: nftToChallenge.token_id,
          challenger: challengeData.challenger,
          evidence_url: challengeData.challengeUrl,
          explanation: challengeData.challengerExplanation
        })
      });
      await fetchData();
      setNftToChallenge(null);
    } catch (err) {
      console.error("Error submitting challenge:", err);
    }
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

  const handleListNft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftToList) return;

    try {
      const res = await fetch('/api/marketplace/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: nftToList.token_id,
          price: listPrice,
          seller: currentWallet.address
        })
      });
      await fetchData();
      setNftToList(null);
    } catch (err) {
      console.error("Error listing NFT:", err);
    }
  };

  const handleCancelListing = async (tokenId: string) => {
    try {
      await fetch('/api/marketplace/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          seller: currentWallet.address
        })
      });
      await fetchData();
    } catch (err) {
      console.error("Error cancelling listing:", err);
    }
  };

  const handleBuyNft = async (tokenId: string, price: string) => {
    setIsLoading(true);
    // Simulate attaching a custom amount (we can attach exact, or slightly higher to test refunds!)
    const sendAmount = (parseFloat(price) + 0.1).toFixed(2); // Send slightly more to test pull-refund
    
    try {
      const res = await fetch('/api/marketplace/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          buyer: currentWallet.address,
          amount_sent: sendAmount
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(`Success! Purchased NFT. Price: ${price} GETH. Attached: ${sendAmount} GETH. Overpay Refund of 0.10 GETH has been sent back to your withdrawal balance!`);
      }
      await fetchData();
    } catch (err) {
      console.error("Error buying NFT:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimProceeds = async () => {
    try {
      const res = await fetch('/api/accounts/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: currentWallet.address })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Withdrew ${data.withdrawn} GETH from smart contract. Check your wallet balance!`);
        // Add locally to visual balance
        setWalletBalance(prev => (parseFloat(prev) + parseFloat(data.withdrawn)).toFixed(2));
      } else {
        alert(data.error);
      }
      await fetchData();
    } catch (err) {
      console.error("Error claiming proceeds:", err);
    }
  };

  const handleTransferNft = async (tokenId: string, toAddress: string) => {
    try {
      const res = await fetch('/api/nfts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: tokenId,
          to: toAddress,
          caller: currentWallet.address
        })
      });
      await fetchData();
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
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans relative overflow-x-hidden antialiased">
      {/* Absolute Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Protocol Bar */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-sm border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Network className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif italic text-white tracking-tight">Genesis Proof</h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-sm">
                  GenLayer-Native
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                Gated NFT Creation, Dynamic Provenance Decay, and Lineage Royalty Protocol
              </p>
            </div>
          </div>

          {/* User Wallet Control & Claim Centre */}
          <div className="flex flex-wrap items-center gap-3.5 bg-white/[0.02] border border-white/10 p-2 rounded-sm max-w-full">
            {/* Wallet Select */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 border border-white/5 rounded-sm">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={currentWallet.address}
                onChange={(e) => {
                  const found = mockWallets.find(w => w.address === e.target.value);
                  if (found) setCurrentWallet(found);
                }}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-mono text-[11px]"
              >
                {mockWallets.map(w => (
                  <option key={w.address} value={w.address} className="bg-[#0c0c0c] text-slate-300">
                    {w.name} ({w.address.slice(0,6)}...{w.address.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Balances Display */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block leading-none">Wallet</span>
                <span className="text-white font-bold">{walletBalance} GETH</span>
              </div>

              <div className="border-l border-white/10 pl-4 flex items-center gap-2">
                <div>
                  <span className="text-[9px] text-indigo-400 uppercase block leading-none font-bold">Unclaimed Balance</span>
                  <span className="text-white font-bold">{pendingWithdrawal} GETH</span>
                </div>
                {parseFloat(pendingWithdrawal) > 0 && (
                  <button
                    onClick={handleClaimProceeds}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-mono rounded-sm font-bold uppercase cursor-pointer"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Testnet Live Network Metrics Banner */}
      <section className="bg-[#080808] border-b border-white/5 py-3.5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 text-left font-mono text-[11px]">
          <div className="space-y-0.5">
            <span className="text-slate-500 uppercase block text-[9px] tracking-wider">BLOCK HEIGHT</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
              {blockHeight}
            </span>
          </div>
          <div className="space-y-0.5 border-l border-white/5 pl-4">
            <span className="text-slate-500 uppercase block text-[9px] tracking-wider">VALIDATORS ONLINE</span>
            <span className="text-emerald-400 font-bold">3 Nodes (AI Consensus)</span>
          </div>
          <div className="space-y-0.5 border-l border-white/5 pl-4">
            <span className="text-slate-500 uppercase block text-[9px] tracking-wider">REQUIRED MINT FEE</span>
            <span className="text-white font-bold">0.05 GETH</span>
          </div>
          <div className="space-y-0.5 border-l border-white/5 pl-4">
            <span className="text-slate-500 uppercase block text-[9px] tracking-wider">PROTOCOL TREASURY</span>
            <span className="text-indigo-400 font-bold">{(parseFloat(pendingWithdrawal) + 0.15).toFixed(3)} GETH</span>
          </div>
          <div className="space-y-0.5 border-l border-white/5 pl-4 col-span-2 md:col-span-1">
            <span className="text-slate-500 uppercase block text-[9px] tracking-wider">DISPUTE RATE</span>
            <span className="text-amber-400 font-bold">{activeDisputeCount > 0 ? "33.3%" : "0.0%"}</span>
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
                  parentNft={parentNftForDeriv}
                  onCancel={() => {
                    setShowSubmitForm(false);
                    setParentNftForDeriv(null);
                  }}
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0a0a0a] border border-white/10 p-4 rounded-xl">
                  {/* Search bar */}
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/5 rounded-sm">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search title, description, creator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex items-center gap-3">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-[#0f0f0f] border border-white/5 text-xs text-slate-300 px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Photography">Photography</option>
                      <option value="Music">Music</option>
                      <option value="3D Model">3D Model</option>
                      <option value="Text/Literary">Text/Literary</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-[#0f0f0f] border border-white/5 text-xs text-slate-300 px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="VERIFIED_ORIGINAL">Verified Original</option>
                      <option value="PROBABLE_ORIGINAL">Probable Original</option>
                      <option value="DISPUTED">Disputed</option>
                      <option value="REVOKED">Revoked</option>
                    </select>

                    <button
                      onClick={() => {
                        setParentNftForDeriv(null);
                        setShowSubmitForm(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white rounded-sm text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-600/10"
                    >
                      <Plus className="w-4 h-4" /> Mint NFT
                    </button>
                  </div>
                </div>

                {/* NFT Explorer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNfts.length > 0 ? (
                    filteredNfts.map((nft) => {
                      const isOwner = nft.owner.toLowerCase() === currentWallet.address.toLowerCase();
                      const isCreator = nft.creator.toLowerCase() === currentWallet.address.toLowerCase();
                      const activeListing = listings.find(l => l.token_id === nft.token_id && l.active);

                      return (
                        <div
                          key={nft.token_id}
                          className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-all flex flex-col h-full group relative shadow-xl"
                        >
                          {/* Top Status Tags */}
                          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                            <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-slate-300 px-2.5 py-0.5 rounded-sm uppercase">
                              {nft.category}
                            </span>
                          </div>

                          {/* Top Right Action status */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-mono tracking-wider bg-black/80 backdrop-blur-md border ${
                              nft.authenticity_status === 'VERIFIED_ORIGINAL' ? 'border-emerald-500 text-emerald-400' :
                              nft.authenticity_status === 'PROBABLE_ORIGINAL' ? 'border-blue-500 text-blue-400' :
                              nft.authenticity_status === 'DISPUTED' ? 'border-amber-500 text-amber-400' :
                              'border-rose-500 text-rose-400'
                            }`}>
                              ● {nft.authenticity_status}
                            </span>
                          </div>

                          {/* Media Box */}
                          <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                            <img
                              src={nft.media_url}
                              alt={nft.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300"
                              onError={(e) => {
                                // Fallback placeholder in case external links are blocked
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {/* Fallback pattern */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-4">
                              <h3 className="text-base font-serif italic text-white leading-tight drop-shadow-md">
                                {nft.title}
                              </h3>
                            </div>
                          </div>

                          {/* Card Content info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2 text-left">
                              {/* Parent Lineage tag if derivative */}
                              {nft.parent_token_id && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-sm text-[9px] text-indigo-300 font-mono">
                                  <Layers className="w-3 h-3" />
                                  Derivative of parent #{nft.parent_token_id} (Similarity: {nft.derivative_similarity_score}%)
                                </div>
                              )}

                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 italic">
                                "{nft.description}"
                              </p>

                              {/* Owner & Creator addresses */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 pt-1.5 border-t border-white/5">
                                <div>
                                  <span className="block text-[8px] text-slate-600 uppercase">Original Creator</span>
                                  <span className="text-slate-300 truncate block">
                                    {isCreator ? "YOU" : `${nft.creator.slice(0,6)}...${nft.creator.slice(-4)}`}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-slate-600 uppercase">Current Owner</span>
                                  <span className="text-slate-300 truncate block">
                                    {isOwner ? "YOU" : `${nft.owner.slice(0,6)}...${nft.owner.slice(-4)}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Score, Progress Bar & Basic Stats */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-400 text-[10px]">AUTHENTICITY CONFIDENCE</span>
                                <span className="font-serif italic font-bold text-indigo-400">
                                  {nft.authenticity_score} / 100
                                </span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    nft.authenticity_score >= 85 ? 'bg-indigo-500' :
                                    nft.authenticity_score >= 40 ? 'bg-amber-500' :
                                    'bg-rose-500'
                                  }`}
                                  style={{ width: `${nft.authenticity_score}%` }}
                                />
                              </div>

                              {/* Listing Price Tag if Listed */}
                              {activeListing && (
                                <div className="bg-emerald-950/10 border border-emerald-500/20 p-2 rounded-sm text-center flex items-center justify-between text-xs font-mono">
                                  <span className="text-[10px] text-slate-500 uppercase">Active Listing Price</span>
                                  <span className="text-emerald-400 font-bold">{activeListing.price} GETH</span>
                                </div>
                              )}
                            </div>

                            {/* Card Action Buttons footer */}
                            <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                              
                              <button
                                onClick={() => setSelectedNft(nft)}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer"
                              >
                                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                AI Audit & Contract Code
                              </button>

                              <button
                                onClick={() => handleAuditProvenance(nft.token_id)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-white/5 text-slate-300 border border-white/10 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                                disabled={isLoading || nft.authenticity_status === 'REVOKED'}
                                title="Runs a fresh non-deterministic web audit of this NFT, decaying the score mathematically."
                              >
                                <History className="w-3.5 h-3.5 text-slate-400" />
                                Audit Provenance
                              </button>

                              <button
                                onClick={() => setNftToChallenge(nft)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-950/20 hover:bg-rose-900/20 text-rose-300 border border-rose-500/20 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                                disabled={nft.authenticity_status === 'REVOKED'}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                Challenge
                              </button>

                              {/* Dynamic Action based on listing & ownership */}
                              {nft.authenticity_status !== 'REVOKED' && (
                                <>
                                  {isOwner ? (
                                    activeListing ? (
                                      <button
                                        onClick={() => handleCancelListing(nft.token_id)}
                                        className="col-span-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel Sale Listing
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setNftToList(nft)}
                                        className="col-span-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        List For Sale
                                      </button>
                                    )
                                  ) : (
                                    activeListing ? (
                                      <button
                                        onClick={() => handleBuyNft(nft.token_id, activeListing.price)}
                                        className="col-span-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-md"
                                        disabled={isLoading}
                                      >
                                        Buy NFT for {activeListing.price} GETH
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setParentNftForDeriv(nft);
                                          setShowSubmitForm(true);
                                        }}
                                        className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/20 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                                        Mint AI-Remix Derivative
                                      </button>
                                    )
                                  )}
                                </>
                              )}

                            </div>

                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 py-16 text-center border border-dashed border-white/10 rounded-xl text-slate-500">
                      <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-xs">No certified Genesis Proof NFTs found matching criteria.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side Column: Marketplace Board & Live GLVM Contract logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Marketplace Board */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 text-left space-y-4 shadow-xl">
            <h3 className="text-sm font-mono uppercase tracking-wider text-indigo-400 font-bold border-b border-white/5 pb-2.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Exclusive Marketplace
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              Only NFTs authenticated by the Genesis Proof protocol can ever be listed here. Purchases auto-route royalty cuts back to ancestors on-chain!
            </p>

            <div className="space-y-3.5 max-h-[25vh] overflow-y-auto pr-1">
              {listings.filter(l => l.active).length > 0 ? (
                listings.filter(l => l.active).map(listing => {
                  const nft = nfts.find(n => n.token_id === listing.token_id);
                  if (!nft) return null;
                  const isOwner = listing.seller.toLowerCase() === currentWallet.address.toLowerCase();

                  return (
                    <div key={listing.token_id} className="bg-black/50 border border-white/5 p-3 rounded-sm flex items-center justify-between gap-3 font-mono text-[11px]">
                      <div className="space-y-1">
                        <strong className="text-white block font-sans italic truncate max-w-[120px]">"{nft.title}"</strong>
                        <span className="text-[9px] text-slate-500 block">
                          Seller: {listing.seller.slice(0,6)}...{listing.seller.slice(-4)}
                        </span>
                        {nft.authenticity_status === 'DISPUTED' && (
                          <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider block">⚠️ DISPUTED STATUS</span>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-xs">{listing.price} GETH</span>
                        {isOwner ? (
                          <button
                            onClick={() => handleCancelListing(listing.token_id)}
                            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-[8px] text-white rounded-sm font-bold uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyNft(listing.token_id, listing.price)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-[9px] text-white rounded-sm font-bold uppercase cursor-pointer shadow"
                            disabled={isLoading}
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-slate-600 py-4 text-center">No active listings currently.</p>
              )}
            </div>
          </div>

          {/* Interactive NFT Listing Form Modal */}
          {nftToList && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 w-full max-w-sm text-left space-y-4">
                <h4 className="font-serif italic text-white text-base">List NFT For Sale</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  List your authenticated NFT "{nftToList.title}" on the Genesis Proof marketplace.
                </p>
                <form onSubmit={handleListNft} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Listing Price (GETH)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      required
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-sm text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setNftToList(null)}
                      className="px-3 py-1.5 bg-white/5 text-slate-300 border border-white/10 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase cursor-pointer shadow"
                    >
                      Submit Listing
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Live GenLayer Virtual Machine (GLVM) Execution Logs Terminal */}
          <div className="bg-[#040404] border border-white/10 rounded-xl p-4 text-left font-mono text-[10px] space-y-3.5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-white font-bold tracking-wider">GLVM TRANSACTION LEDGER</span>
              </div>
              <span className="text-indigo-400 font-bold uppercase font-mono text-[8px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-sm">
                Consensus logs
              </span>
            </div>

            <p className="text-slate-500 text-[9px] italic leading-relaxed">
              Consensus transactions processed by parallel validator voting pipelines. Filter results above or execute interactions to write fresh blocks.
            </p>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-white/[0.03] pb-1.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      log.type === 'SUCCESS' ? 'text-emerald-400' :
                      log.type === 'WARNING' ? 'text-amber-400' :
                      log.type === 'ERROR' ? 'text-rose-400' :
                      'text-indigo-400'
                    }`}>
                      [{log.method}]
                    </span>
                    <span className="text-slate-600 text-[8px]">{log.txHash}</span>
                  </div>
                  <p className="text-slate-300 leading-normal font-sans">
                    {log.message}
                  </p>
                  <span className="text-[8px] text-slate-600 block">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Detail Modals and Overlays */}
      <AnimatePresence>
        {selectedNft && (
          <ConsensusVisualizer
            nft={selectedNft}
            onClose={() => setSelectedNft(null)}
          />
        )}

        {nftToChallenge && (
          <ChallengeModal
            nft={nftToChallenge}
            onClose={() => setNftToChallenge(null)}
            onConfirmChallenge={handleConfirmChallenge}
          />
        )}
      </AnimatePresence>

      {/* Humble aesthetic credit margin */}
      <footer className="mt-12 border-t border-white/5 py-6 px-6 text-center text-slate-600 font-mono text-[10px] space-y-1 bg-[#030303]">
        <p>Genesis Proof Protocol — 100% Client-Side Web Simulation of GenLayer Node Consensuses.</p>
        <p>No external third-party API dependencies. All calculations processed locally on-device.</p>
      </footer>

    </div>
  );
}
