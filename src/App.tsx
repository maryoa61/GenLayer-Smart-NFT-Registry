import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatentNFT } from './types';
import PatentCard from './components/PatentCard';
import ConsensusVisualizer from './components/ConsensusVisualizer';
import SubmitPatentForm from './components/SubmitPatentForm';
import ChallengeModal from './components/ChallengeModal';
import { Network, Plus, Search, HelpCircle, Activity, Shield, Cpu, RefreshCw, Layers, Sparkles, Filter } from 'lucide-react';

export default function App() {
  const [patents, setPatents] = useState<PatentNFT[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedPatent, setSelectedPatent] = useState<PatentNFT | null>(null);
  const [patentToChallenge, setPatentToChallenge] = useState<PatentNFT | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Testnet Live Metrics
  const [blockHeight, setBlockHeight] = useState(842910);
  const [gasPrice, setGasPrice] = useState(12.4);

  useEffect(() => {
    fetchPatents();

    // Increment block height periodically to simulate real blockchain activity
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
      setGasPrice(prev => Number((prev + (Math.random() * 2 - 1)).toFixed(1)));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const fetchPatents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/patents');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatents(data);
      }
    } catch (err) {
      console.error('Error fetching patent NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPatent = async (patentData: any) => {
    try {
      const res = await fetch('/api/patents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patentData)
      });
      const data = await res.json();
      if (data && data.id) {
        // Refresh patents database from backend to show new record
        await fetchPatents();
        setShowSubmitForm(false);
        return data;
      }
    } catch (err) {
      console.error('Error registering patent:', err);
    }
    return null;
  };

  const handleConfirmChallenge = async (challengeData: { challenger: string; challengerExplanation: string; challengeUrl: string }) => {
    if (!patentToChallenge) return;
    try {
      const res = await fetch('/api/patents/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: patentToChallenge.id,
          ...challengeData
        })
      });
      const data = await res.json();
      if (data && data.id) {
        await fetchPatents();
        setPatentToChallenge(null);
      }
    } catch (err) {
      console.error('Error submitting challenge:', err);
    }
  };

  const filteredPatents = patents.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    'AI & Big Data',
    'Cryptography & Network Security',
    'Biotechnology & Medical Engineering',
    'CleanTech & Renewable Energy',
    'IoT & Advanced Hardware',
    'Other Advanced Industries'
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 antialiased selection:text-white border-t-8 border-[#1a1a1a]" dir="ltr">
      {/* Visual Ambient Light Effect */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.01] rounded-full blur-3xl pointer-events-none" />

      {/* Navigation / Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a] px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/30">
              G
            </div>
              <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif italic text-white tracking-wide leading-none">Aetheris Patent Registry</h1>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest">
                  GenLayer Smart Collection
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Decentralized IP registration as dynamic on-chain NFTs with AI Consensus</p>
            </div>
          </div>

          {/* Action / Stats Bar */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Live Stats */}
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <div className="flex items-center gap-2 text-indigo-300">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                <span>Block: <strong className="text-white">{blockHeight}</strong></span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span>Gas Fee: <strong className="text-white">{gasPrice} GL-Gwei</strong></span>
              </div>
            </div>

            {/* Connect Vault Button */}
            <button 
              className="bg-white text-black px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors active:scale-95 cursor-pointer"
              onClick={() => alert('Your smart vault is connected on the GenLayer testnet environment.')}
              id="connect-vault-btn"
            >
              Connect Vault
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
        <AnimatePresence mode="wait">
          {!showSubmitForm ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              key="explorer"
              className="space-y-6"
            >
              {/* Promo Banner / Info Section */}
              <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                <div className="space-y-3 z-10 text-left">
                  <h2 className="text-2xl font-serif italic text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Revolutionizing IP Rights with GenLayer
                  </h2>
                  <p className="text-sm text-slate-300 italic max-w-2xl leading-relaxed">
                    Registering Intellectual Property through traditional patent offices takes months. GenLayer combines smart contracts with LLM-based web oracles to verify novelty and mint dynamic IP NFTs on-chain in seconds.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="bg-white text-black px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all cursor-pointer z-10 whitespace-nowrap shadow-xl shadow-black/40"
                  id="btn-register-new"
                >
                  Register New Idea (IP NFT)
                </button>
              </div>

              {/* Filtering & Search Header */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                {/* Search input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, ID, creator..."
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    id="search-input"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-sm text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                      id="filter-category"
                    >
                      <option value="ALL" className="bg-[#050505]">All Categories</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat} className="bg-[#050505]">{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-sm text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                    id="filter-status"
                  >
                    <option value="ALL" className="bg-[#050505]">All Statuses</option>
                    <option value="APPROVED" className="bg-[#050505]">Approved</option>
                    <option value="DISPUTED" className="bg-[#050505]">Disputed</option>
                    <option value="REVOKED" className="bg-[#050505]">Revoked</option>
                  </select>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchPatents}
                    className="p-2 text-slate-400 hover:text-white bg-black/40 border border-white/10 rounded-sm hover:bg-white/5 transition-colors cursor-pointer"
                    title="Refresh Data"
                    id="btn-refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patents NFT Grid */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Layers className="w-10 h-10 text-indigo-500 animate-bounce" />
                  <p className="text-xs text-slate-500 font-mono tracking-wider">LOADING SMART COLLECTION LEDGER...</p>
                </div>
              ) : filteredPatents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPatents.map((patent) => (
                    <PatentCard
                      key={patent.id}
                      patent={patent}
                      onViewConsensus={(p) => setSelectedPatent(p)}
                      onChallenge={(p) => setPatentToChallenge(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-serif italic text-white text-lg">No Items Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    No patent NFTs match the selected filters. You can register a new idea to issue the first on-chain dynamic IP certificate.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Submission Form view */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              key="submit-form"
            >
              <SubmitPatentForm
                onSubmit={handleRegisterPatent}
                onCancel={() => setShowSubmitForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Consensus audit log Modal */}
      <AnimatePresence>
        {selectedPatent && (
          <ConsensusVisualizer
            patent={selectedPatent}
            onClose={() => setSelectedPatent(null)}
          />
        )}
      </AnimatePresence>

      {/* Challenge submission Modal */}
      <AnimatePresence>
        {patentToChallenge && (
          <ChallengeModal
            patent={patentToChallenge}
            onClose={() => setPatentToChallenge(null)}
            onConfirmChallenge={handleConfirmChallenge}
          />
        )}
      </AnimatePresence>

      {/* Bottom Footer */}
      <footer className="border-t border-white/5 bg-[#050505] px-4 md:px-8 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Powered by GenLayer Intelligent Validator Nodes</span>
          </div>
          <span className="text-[10px]">All intellectual property rights are protected on-chain on the GenLayer testnet environment.</span>
        </div>
      </footer>
    </div>
  );
}
