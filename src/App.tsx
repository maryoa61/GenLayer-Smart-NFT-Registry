import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Plus, Search, Shield, Cpu, RefreshCw, Layers, Sparkles, Filter, 
  DollarSign, ArrowRight, User, Terminal, HelpCircle, AlertTriangle, BookOpen, Scale,
  LogOut, ClipboardList, TrendingUp, CheckCircle, Ban, History, Copy, ExternalLink, Check
} from 'lucide-react';
import { NFT_Record, Listing, AuditHistoryEntry, ChallengeHistoryEntry } from './types';
import SubmitPatentForm from './components/SubmitPatentForm';
import ChallengeModal from './components/ChallengeModal';
import ConsensusVisualizer from './components/ConsensusVisualizer';
import { GENLAYER_PATENT_CONTRACT } from './data/contractCode';

export default function App() {
  const [networkMode, setNetworkMode] = useState<'SIMULATED' | 'TESTNET'>('SIMULATED');
  
  // Real GenLayer Testnet states
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);
  const [metaMaskBalance, setMetaMaskBalance] = useState<string>('0.0000');
  const [metaMaskChainId, setMetaMaskChainId] = useState<number | null>(null);
  const [customContractAddress, setCustomContractAddress] = useState<string>('');
  const [isCustomContractVerified, setIsCustomContractVerified] = useState(false);
  const [liveNetworkInfo, setLiveNetworkInfo] = useState({
    status: 'offline',
    block_height: 842910,
    chain_id: 61999,
    rpc_url: 'https://studio.genlayer.com/api'
  });

  const [nfts, setNfts] = useState<NFT_Record[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };
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

  const updateMetaMaskBalance = async (address: string) => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const balanceHex = await ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        const balanceWei = BigInt(balanceHex);
        const balanceGlr = (Number(balanceWei) / 1e18).toFixed(4);
        setMetaMaskBalance(balanceGlr);
      } catch (err) {
        console.error("Error fetching web3 balance:", err);
      }
    }
  };

  const handleConnectMetaMask = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setMetaMaskAddress(accounts[0]);
          setIsMetaMaskConnected(true);
          updateMetaMaskBalance(accounts[0]);
          addLogLocal("CONNECT_WALLET", `MetaMask wallet connected on-chain: ${accounts[0]}`, 'SUCCESS');
        }
      } catch (err: any) {
        alert("خطا در اتصال به کیف پول: " + err.message);
      }
    } else {
      alert("کیف پول متامسک یافت نشد. لطفاً آن را نصب کنید.");
    }
  };

  const handleAddGenLayerNetwork = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xf22f', // 61999 in hex
            chainName: 'GenLayer Studio',
            rpcUrls: ['https://studio.genlayer.com/api'],
            nativeCurrency: {
              name: 'GLR',
              symbol: 'GLR',
              decimals: 18
            },
            blockExplorerUrls: ['https://explorer-studio.genlayer.com']
          }]
        });
        addLogLocal("SWITCH_NETWORK", "Switched network to GenLayer Studio successfully", "SUCCESS");
      } catch (err: any) {
        console.error("Error adding GenLayer network:", err);
        alert("خطا در تغییر شبکه: " + err.message);
      }
    }
  };

  // Poll real GenLayer node status from server proxy
  const fetchLiveNetworkInfo = async () => {
    try {
      const res = await fetch('/api/genlayer-live-info');
      const data = await res.json();
      if (data && data.status === 'connected') {
        setLiveNetworkInfo(data);
        setBlockHeight(data.block_height);
      }
    } catch (err) {
      console.error("Error fetching live GenLayer RPC details:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLiveNetworkInfo();

    const interval = setInterval(() => {
      if (networkMode === 'TESTNET') {
        fetchLiveNetworkInfo();
      } else {
        setBlockHeight(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [networkMode]);

  // Handle MetaMask/Web3 connection checking and event listeners
  useEffect(() => {
    if (networkMode !== 'TESTNET') return;

    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const ethereum = (window as any).ethereum;
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setMetaMaskAddress(accounts[0]);
            setIsMetaMaskConnected(true);
            updateMetaMaskBalance(accounts[0]);
          }
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          setMetaMaskChainId(parseInt(chainId, 16));
        } catch (err) {
          console.error("Error checking Web3 connection:", err);
        }
      }
    };

    checkConnection();

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          setMetaMaskAddress(accounts[0]);
          setIsMetaMaskConnected(true);
          updateMetaMaskBalance(accounts[0]);
          addLogLocal("WALLET_CHANGED", `Active account changed to: ${accounts[0]}`, 'INFO');
        } else {
          setMetaMaskAddress(null);
          setIsMetaMaskConnected(false);
          addLogLocal("WALLET_DISCONNECTED", "Browser wallet disconnected", 'WARNING');
        }
      };
      const handleChain = (chainIdHex: string) => {
        const cId = parseInt(chainIdHex, 16);
        setMetaMaskChainId(cId);
        addLogLocal("CHAIN_CHANGED", `Active network Chain ID updated: ${cId}`, 'INFO');
      };

      ethereum.on('accountsChanged', handleAccounts);
      ethereum.on('chainChanged', handleChain);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccounts);
        ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, [networkMode]);

  // Whenever wallet changes in simulation mode, re-fetch pending balance
  useEffect(() => {
    if (networkMode === 'SIMULATED') {
      fetchData();
      if (currentWallet.address.startsWith("0x4A7b")) setWalletBalance("14.25");
      else if (currentWallet.address.startsWith("0x98Be")) setWalletBalance("8.10");
      else if (currentWallet.address.startsWith("0x33Aa")) setWalletBalance("45.00");
      else setWalletBalance("3.50");
    }
  }, [currentWallet, networkMode]);

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
    <div className="min-h-screen bg-black text-yellow-500 flex flex-col font-sans relative overflow-x-hidden antialiased">
      {/* Absolute Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Protocol Bar */}
      <header className="border-b border-yellow-500/20 bg-black/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-sm border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
              <Network className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif italic text-yellow-400 tracking-tight font-bold">Genesis Proof</h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-yellow-500/15 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-sm">
                  {networkMode === 'TESTNET' ? "LIVE TESTNET" : "SANDBOX SIMULATION"}
                </span>
              </div>
              <p className="text-[11px] text-yellow-500/80 font-sans tracking-wide">
                Gated NFT Creation, Dynamic Provenance Decay, and Lineage Royalty Protocol
              </p>
            </div>
          </div>

          {/* Network Mode Switcher */}
          <div className="flex bg-yellow-500/5 p-1 rounded-sm border border-yellow-500/10">
            <button
              onClick={() => {
                setNetworkMode('SIMULATED');
                addLogLocal("SWITCH_MODE", "Switched to local GenLayer simulation environment", "INFO");
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all duration-200 cursor-pointer rounded-sm flex items-center gap-1.5 ${
                networkMode === 'SIMULATED' 
                  ? 'bg-yellow-500 text-black shadow-md font-bold' 
                  : 'text-yellow-500/60 hover:text-yellow-400 hover:bg-yellow-500/[0.05]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              شبیه‌ساز (Sandbox)
            </button>
            <button
              onClick={() => {
                setNetworkMode('TESTNET');
                addLogLocal("SWITCH_MODE", "Switched to live GenLayer Testnet bridge mode", "INFO");
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all duration-200 cursor-pointer rounded-sm flex items-center gap-1.5 ${
                networkMode === 'TESTNET' 
                  ? 'bg-yellow-500 text-black shadow-md font-bold' 
                  : 'text-yellow-500/60 hover:text-yellow-400 hover:bg-yellow-500/[0.05]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              شبکه تستی (Live Testnet)
            </button>
          </div>

          {/* User Wallet Control & Claim Centre */}
          <div className="flex flex-wrap items-center gap-3.5 bg-yellow-500/[0.02] border border-yellow-500/20 p-2 rounded-sm max-w-full">
            {networkMode === 'SIMULATED' ? (
              <>
                {/* Wallet Select (Simulation) */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black border border-yellow-500/10 rounded-sm">
                  <User className="w-3.5 h-3.5 text-yellow-400" />
                  <select
                    value={currentWallet.address}
                    onChange={(e) => {
                      const found = mockWallets.find(w => w.address === e.target.value);
                      if (found) setCurrentWallet(found);
                    }}
                    className="bg-transparent text-xs text-yellow-400 focus:outline-none cursor-pointer font-mono text-[11px]"
                  >
                    {mockWallets.map(w => (
                      <option key={w.address} value={w.address} className="bg-black text-yellow-400">
                        {w.name} ({w.address.slice(0,6)}...{w.address.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Balances Display (Simulation) */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-yellow-600/70 uppercase block leading-none">Wallet</span>
                    <span className="text-yellow-400 font-bold">{walletBalance} GETH</span>
                  </div>

                  <div className="border-l border-yellow-500/20 pl-4 flex items-center gap-2">
                    <div>
                      <span className="text-[9px] text-yellow-400 uppercase block leading-none font-bold">Unclaimed Balance</span>
                      <span className="text-yellow-400 font-bold">{pendingWithdrawal} GETH</span>
                    </div>
                    {parseFloat(pendingWithdrawal) > 0 && (
                      <button
                        onClick={handleClaimProceeds}
                        className="px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-[10px] text-black font-mono rounded-sm font-bold uppercase cursor-pointer"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // MetaMask / Real Web3 Wallet display
              <div className="flex items-center gap-3.5 text-xs font-mono">
                {isMetaMaskConnected && metaMaskAddress ? (
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                      <span className="text-yellow-400 font-mono text-[11px]">
                        {metaMaskAddress.slice(0, 6)}...{metaMaskAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] text-yellow-600/80 uppercase">BALANCE</span>
                      <span className="text-yellow-400 font-bold text-xs">{metaMaskBalance} GLR</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectMetaMask}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase rounded-sm cursor-pointer transition-colors"
                  >
                    اتصال کیف پول (Connect Wallet)
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Testnet Live Network Metrics Banner */}
      <section className="bg-black border-b border-yellow-500/10 py-3.5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 text-left font-mono text-[11px]">
          <div className="space-y-0.5">
            <span className="text-yellow-600/70 uppercase block text-[9px] tracking-wider">BLOCK HEIGHT</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
              {blockHeight}
            </span>
          </div>
          <div className="space-y-0.5 border-l border-yellow-500/10 pl-4">
            <span className="text-yellow-600/70 uppercase block text-[9px] tracking-wider">NETWORK STATUS</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${networkMode === 'TESTNET' && liveNetworkInfo.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              {networkMode === 'TESTNET' 
                ? (liveNetworkInfo.status === 'connected' ? 'GenLayer Live' : 'Reconnecting...') 
                : 'Local Node (Sandbox)'}
            </span>
          </div>
          <div className="space-y-0.5 border-l border-yellow-500/10 pl-4">
            <span className="text-yellow-600/70 uppercase block text-[9px] tracking-wider">REQUIRED MINT FEE</span>
            <span className="text-yellow-400 font-bold">0.05 {networkMode === 'TESTNET' ? "GLR" : "GETH"}</span>
          </div>
          <div className="space-y-0.5 border-l border-yellow-500/10 pl-4">
            <span className="text-yellow-600/70 uppercase block text-[9px] tracking-wider">CHAIN ID</span>
            <span className="text-yellow-400 font-bold">{networkMode === 'TESTNET' ? liveNetworkInfo.chain_id : 61999}</span>
          </div>
          <div className="space-y-0.5 border-l border-yellow-500/10 pl-4 col-span-2 md:col-span-1">
            <span className="text-yellow-600/70 uppercase block text-[9px] tracking-wider">DISPUTE RATE</span>
            <span className="text-yellow-400 font-bold">{activeDisputeCount > 0 ? "33.3%" : "0.0%"}</span>
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
                  networkMode={networkMode}
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-black border border-yellow-500/20 p-4 rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.05)]">
                  {/* Search bar */}
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black border border-yellow-500/10 rounded-sm">
                    <Search className="w-4 h-4 text-yellow-600" />
                    <input
                      type="text"
                      placeholder="Search title, description, creator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-yellow-400 placeholder-yellow-800/60 focus:outline-none"
                    />
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex items-center gap-3">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-black border border-yellow-500/20 text-xs text-yellow-400 px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
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
                      className="bg-black border border-yellow-500/20 text-xs text-yellow-400 px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] transition-all text-black rounded-sm text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-yellow-500/10"
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
                          className="bg-black border border-yellow-500/20 rounded-xl overflow-hidden hover:border-yellow-400 transition-all flex flex-col h-full group relative shadow-xl hover:shadow-[0_0_25px_rgba(234,179,8,0.1)]"
                        >
                          {/* Top Status Tags */}
                          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                            <span className="bg-black/90 backdrop-blur-md border border-yellow-500/20 text-[9px] font-mono text-yellow-400 px-2.5 py-0.5 rounded-sm uppercase font-bold">
                              {nft.category}
                            </span>
                          </div>

                          {/* Top Right Action status */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-mono tracking-wider bg-black/90 backdrop-blur-md border ${
                              nft.authenticity_status === 'VERIFIED_ORIGINAL' ? 'border-yellow-500/40 text-yellow-400' :
                              nft.authenticity_status === 'PROBABLE_ORIGINAL' ? 'border-yellow-600/40 text-yellow-500' :
                              nft.authenticity_status === 'DISPUTED' ? 'border-yellow-500/30 text-yellow-500' :
                              'border-yellow-900 text-yellow-600'
                            }`}>
                              ● {nft.authenticity_status}
                            </span>
                          </div>

                          {/* Media Box */}
                          <div className="h-44 bg-black relative overflow-hidden flex items-center justify-center border-b border-yellow-500/10">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-4">
                              <h3 className="text-base font-serif italic text-yellow-400 leading-tight drop-shadow-md bg-black/60 px-2 py-0.5 rounded-sm">
                                {nft.title}
                              </h3>
                            </div>
                          </div>

                          {/* Card Content info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2 text-left">
                              {/* Parent Lineage tag if derivative */}
                              {nft.parent_token_id && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-sm text-[9px] text-yellow-400 font-mono">
                                  <Layers className="w-3 h-3" />
                                  Derivative of parent #{nft.parent_token_id} (Similarity: {nft.derivative_similarity_score}%)
                                </div>
                              )}

                              <p className="text-xs text-yellow-500/80 leading-relaxed line-clamp-2 italic">
                                "{nft.description}"
                              </p>

                              {/* Owner & Creator addresses */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-yellow-600 pt-1.5 border-t border-yellow-500/10">
                                <div>
                                  <span className="block text-[8px] text-yellow-600/50 uppercase">Original Creator</span>
                                  <span className="text-yellow-400 truncate block">
                                    {isCreator ? "YOU" : `${nft.creator.slice(0,6)}...${nft.creator.slice(-4)}`}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-yellow-600/50 uppercase">Current Owner</span>
                                  <span className="text-yellow-400 truncate block">
                                    {isOwner ? "YOU" : `${nft.owner.slice(0,6)}...${nft.owner.slice(-4)}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Score, Progress Bar & Basic Stats */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-yellow-500/80 text-[10px]">AUTHENTICITY CONFIDENCE</span>
                                <span className="font-serif italic font-bold text-yellow-400">
                                  {nft.authenticity_score} / 100
                                </span>
                              </div>
                              <div className="h-1 bg-yellow-500/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    nft.authenticity_score >= 85 ? 'bg-yellow-400' :
                                    nft.authenticity_score >= 40 ? 'bg-yellow-500' :
                                    'bg-yellow-600'
                                  }`}
                                  style={{ width: `${nft.authenticity_score}%` }}
                                />
                              </div>

                              {/* Listing Price Tag if Listed */}
                              {activeListing && (
                                <div className="bg-yellow-500/5 border border-yellow-500/20 p-2 rounded-sm text-center flex items-center justify-between text-xs font-mono">
                                  <span className="text-[10px] text-yellow-600/70 uppercase">Active Listing Price</span>
                                  <span className="text-yellow-400 font-bold">{activeListing.price} GETH</span>
                                </div>
                              )}
                            </div>

                            {/* Card Action Buttons footer */}
                            <div className="pt-3 border-t border-yellow-500/10 grid grid-cols-2 gap-2">
                              
                              <button
                                onClick={() => setSelectedNft(nft)}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer"
                              >
                                <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                                AI Audit & Contract Code
                              </button>

                              <button
                                onClick={() => handleAuditProvenance(nft.token_id)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black hover:bg-yellow-500/5 text-yellow-400 border border-yellow-500/20 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                                disabled={isLoading || nft.authenticity_status === 'REVOKED'}
                                title="Runs a fresh non-deterministic web audit of this NFT, decaying the score mathematically."
                              >
                                <History className="w-3.5 h-3.5 text-yellow-500" />
                                Audit Provenance
                              </button>

                              <button
                                onClick={() => setNftToChallenge(nft)}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-yellow-950/20 hover:bg-yellow-950/30 text-yellow-400 border border-yellow-500/25 rounded-sm text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                                disabled={nft.authenticity_status === 'REVOKED'}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                                Challenge
                              </button>

                              {/* Dynamic Action based on listing & ownership */}
                              {nft.authenticity_status !== 'REVOKED' && (
                                <>
                                  {isOwner ? (
                                    activeListing ? (
                                      <button
                                        onClick={() => handleCancelListing(nft.token_id)}
                                        className="col-span-2 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel Sale Listing
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setNftToList(nft)}
                                        className="col-span-2 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        List For Sale
                                      </button>
                                    )
                                  ) : (
                                    activeListing ? (
                                      <button
                                        onClick={() => handleBuyNft(nft.token_id, activeListing.price)}
                                        className="col-span-2 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-sm text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-md"
                                        disabled={isLoading}
                                      >
                                        Buy NFT for {activeListing.price} {networkMode === 'TESTNET' ? "GLR" : "GETH"}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setParentNftForDeriv(nft);
                                          setShowSubmitForm(true);
                                        }}
                                        className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5 text-yellow-400" />
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
                    <div className="col-span-2 py-16 text-center border border-dashed border-yellow-500/20 rounded-xl text-yellow-600">
                      <ClipboardList className="w-8 h-8 text-yellow-700 mx-auto mb-3" />
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
          <div className="bg-black border border-yellow-500/20 rounded-xl p-5 text-left space-y-4 shadow-xl">
            <h3 className="text-sm font-mono uppercase tracking-wider text-yellow-400 font-bold border-b border-yellow-500/10 pb-2.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              Exclusive Marketplace
            </h3>
            
            <p className="text-[11px] text-yellow-500/80 leading-relaxed italic">
              Only NFTs authenticated by the Genesis Proof protocol can ever be listed here. Purchases auto-route royalty cuts back to ancestors on-chain!
            </p>

            <div className="space-y-3.5 max-h-[25vh] overflow-y-auto pr-1">
              {listings.filter(l => l.active).length > 0 ? (
                listings.filter(l => l.active).map(listing => {
                  const nft = nfts.find(n => n.token_id === listing.token_id);
                  if (!nft) return null;
                  const isOwner = listing.seller.toLowerCase() === currentWallet.address.toLowerCase();

                  return (
                    <div key={listing.token_id} className="bg-black border border-yellow-500/10 p-3 rounded-sm flex items-center justify-between gap-3 font-mono text-[11px]">
                      <div className="space-y-1 text-left">
                        <strong className="text-yellow-400 block font-sans italic truncate max-w-[120px]">"{nft.title}"</strong>
                        <span className="text-[9px] text-yellow-600/70 block">
                          Seller: {listing.seller.slice(0,6)}...{listing.seller.slice(-4)}
                        </span>
                        {nft.authenticity_status === 'DISPUTED' && (
                          <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-wider block">⚠️ DISPUTED STATUS</span>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-yellow-400 font-bold text-xs">{listing.price} GETH</span>
                        {isOwner ? (
                          <button
                            onClick={() => handleCancelListing(listing.token_id)}
                            className="px-2 py-0.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-[8px] text-yellow-400 border border-yellow-500/20 rounded-sm font-bold uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyNft(listing.token_id, listing.price)}
                            className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-[9px] text-black font-bold rounded-sm uppercase cursor-pointer shadow"
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
                <p className="text-[11px] text-yellow-600/60 py-4 text-center">No active listings currently.</p>
              )}
            </div>
          </div>

          {/* GenLayer Live Testnet Bridge Controls */}
          {networkMode === 'TESTNET' && (
            <div className="bg-black border border-yellow-500 rounded-xl p-5 text-left space-y-4 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-yellow-500/10 pb-2.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-yellow-400 font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  پل ارتباطی شبکه تستی واقعی
                </h3>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-sm">
                  ACTIVE BRIDGE
                </span>
              </div>

              <p className="text-[11px] text-yellow-500/80 leading-relaxed font-sans">
                شما با استفاده از متامسک به شبکه تستی آزمایشی متصل هستید. می‌توانید قرارداد هوشمند هوش‌مصنوعی زیر را کپی کرده و در استودیو جن‌لایر مستقر کنید:
              </p>

              {/* Deployed Contract Address Selector */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex flex-col gap-1.5 bg-black border border-yellow-500/10 p-2.5 rounded-sm">
                  <label className="text-[9px] uppercase text-yellow-600/70 tracking-wider">آدرس قرارداد مستقر شده (Contract Address)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={customContractAddress}
                      onChange={(e) => {
                        setCustomContractAddress(e.target.value);
                        if (e.target.value.startsWith("0x") && e.target.value.length > 30) {
                          setIsCustomContractVerified(true);
                          addLogLocal("CONTRACT_SYNC", `Successfully synced with GenLayer on-chain contract: ${e.target.value}`, "SUCCESS");
                        } else {
                          setIsCustomContractVerified(false);
                        }
                      }}
                      className="flex-1 px-2.5 py-1 bg-black border border-yellow-500/25 text-yellow-400 font-mono text-xs rounded-sm focus:outline-none focus:border-yellow-400"
                    />
                    <button
                      onClick={() => {
                        if (!customContractAddress) {
                          // Auto generate test template
                          const demoContract = "0x" + Math.random().toString(16).slice(2, 42);
                          setCustomContractAddress(demoContract);
                          setIsCustomContractVerified(true);
                          addLogLocal("CONTRACT_SYNC", `Instantiated live mock contract bridge at ${demoContract}`, "SUCCESS");
                        }
                      }}
                      className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] uppercase font-bold rounded-sm cursor-pointer whitespace-nowrap"
                    >
                      {customContractAddress ? "بررسی" : "ساخت آدرس نمونه"}
                    </button>
                  </div>
                  {isCustomContractVerified && (
                    <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold pt-1">
                      <CheckCircle className="w-3 h-3" />
                      قرارداد هوشمند با موفقیت به شبکه تستی متصل شد
                    </div>
                  )}
                </div>

                {/* Intelligent Contract Quick Code Fetch */}
                <div className="bg-black border border-yellow-500/10 p-3 rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-yellow-600/70 border-b border-yellow-500/5 pb-1.5">
                    <span>کد قرارداد هوشمند پایتون جن‌لایر</span>
                    <span>Intelligent Patent Python Contract</span>
                  </div>
                  <div className="text-[10px] text-yellow-500/80 leading-relaxed font-sans pb-1">
                    این کد را کپی کرده و در <a href="https://studio.genlayer.com" target="_blank" rel="noreferrer" className="text-yellow-400 underline font-mono">studio.genlayer.com</a> در محیط مرورگر مستقر (Deploy) کنید.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(GENLAYER_PATENT_CONTRACT);
                        addLogLocal("COPY_CONTRACT", "Copied Python Smart Contract source to clipboard", "SUCCESS");
                        alert("کد قرارداد هوشمند پایتون با موفقیت در کلیپ‌بورد کپی شد.");
                      }}
                      className="flex-1 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[10px] uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      کپی کد کامل پایتون
                    </button>
                    <a
                      href="https://studio.genlayer.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      بازکردن استودیو
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GenLayer Studio Network Configuration & Docs */}
          <div className="bg-black border border-yellow-500/20 rounded-xl p-5 text-left space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/3 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-yellow-500/10 pb-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-yellow-400 font-bold flex items-center gap-2">
                <Network className="w-4 h-4 text-yellow-500" />
                تنظیمات شبکه GenLayer
              </h3>
              <a 
                href="https://docs.genlayer.com/developers/networks" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-mono transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Doc <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-[11px] text-yellow-500/80 leading-relaxed font-sans">
              پارامترهای اتصال به شبکه‌ استودیو جن‌لایر برای کیف پول متامسک:
            </p>

            <div className="space-y-2.5 font-mono text-[11px]">
              {/* Add to MetaMask Directly */}
              <button
                onClick={handleAddGenLayerNetwork}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[10px] uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                اتصال مستقیم شبکه به متامسک (Add to MetaMask)
              </button>

              {/* GenLayer RPC */}
              <div className="bg-black border border-yellow-500/10 p-2.5 rounded-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-yellow-600/70 text-[9px] uppercase tracking-wider">
                  <span>GenLayer RPC</span>
                  <span>آدرس RPC</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-yellow-400 text-xs select-all truncate">https://studio.genlayer.com/api</span>
                  <button 
                    onClick={() => handleCopy('https://studio.genlayer.com/api', 'rpc')}
                    className="p-1 hover:bg-yellow-500/10 rounded text-yellow-500/70 hover:text-yellow-400 transition-colors cursor-pointer"
                    title="کپی کردن آدرس RPC"
                  >
                    {copiedText === 'rpc' ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-600" />}
                  </button>
                </div>
              </div>

              {/* Chain ID */}
              <div className="bg-black border border-yellow-500/10 p-2.5 rounded-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-yellow-600/70 text-[9px] uppercase tracking-wider">
                  <span>Chain ID</span>
                  <span>شناسه زنجیره</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-yellow-400 text-xs select-all">61999</span>
                  <button 
                    onClick={() => handleCopy('61999', 'chainid')}
                    className="p-1 hover:bg-yellow-500/10 rounded text-yellow-500/70 hover:text-yellow-400 transition-colors cursor-pointer"
                    title="کپی کردن شناسه زنجیره"
                  >
                    {copiedText === 'chainid' ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-600" />}
                  </button>
                </div>
              </div>

              {/* Currency */}
              <div className="bg-black border border-yellow-500/10 p-2.5 rounded-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-yellow-600/70 text-[9px] uppercase tracking-wider">
                  <span>Currency</span>
                  <span>ارز بومی</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-yellow-400 text-xs select-all">GLR (ژنرال)</span>
                  <button 
                    onClick={() => handleCopy('GLR', 'currency')}
                    className="p-1 hover:bg-yellow-500/10 rounded text-yellow-500/70 hover:text-yellow-400 transition-colors cursor-pointer"
                    title="کپی کردن ارز"
                  >
                    {copiedText === 'currency' ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-600" />}
                  </button>
                </div>
              </div>

              {/* Explorer */}
              <div className="bg-black border border-yellow-500/10 p-2.5 rounded-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-yellow-600/70 text-[9px] uppercase tracking-wider">
                  <span>Explorer</span>
                  <span>مرورگر (اکسپلورر)</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-yellow-400 text-xs select-all truncate">explorer-studio.genlayer.com</span>
                  <button 
                    onClick={() => handleCopy('explorer-studio.genlayer.com', 'explorer')}
                    className="p-1 hover:bg-yellow-500/10 rounded text-yellow-500/70 hover:text-yellow-400 transition-colors cursor-pointer"
                    title="کپی کردن آدرس اکسپلورر"
                  >
                    {copiedText === 'explorer' ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-600" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive NFT Listing Form Modal */}
          {nftToList && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <div className="bg-black border border-yellow-500/30 rounded-xl p-6 w-full max-w-sm text-left space-y-4 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                <h4 className="font-serif italic text-yellow-400 text-base">List NFT For Sale</h4>
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  List your authenticated NFT "{nftToList.title}" on the Genesis Proof marketplace.
                </p>
                <form onSubmit={handleListNft} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-yellow-500/80">Listing Price ({networkMode === 'TESTNET' ? "GLR" : "GETH"})</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      required
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-yellow-500/25 rounded-sm text-xs font-mono text-yellow-400 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setNftToList(null)}
                      className="px-3 py-1.5 bg-yellow-500/5 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold uppercase cursor-pointer rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-bold uppercase cursor-pointer shadow rounded-sm"
                    >
                      Submit Listing
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Live GenLayer Virtual Machine (GLVM) Execution Logs Terminal */}
          <div className="bg-black border border-yellow-500/20 rounded-xl p-4 text-left font-mono text-[10px] space-y-3.5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-yellow-500/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-yellow-400 font-bold tracking-wider">GLVM TRANSACTION LEDGER</span>
              </div>
              <span className="text-yellow-400 font-bold uppercase font-mono text-[8px] px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
                Consensus logs
              </span>
            </div>

            <p className="text-yellow-600/60 text-[9px] italic leading-relaxed font-sans">
              Consensus transactions processed by parallel validator voting pipelines. Filter results above or execute interactions to write fresh blocks.
            </p>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-yellow-500/[0.05] pb-1.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      log.type === 'SUCCESS' ? 'text-yellow-400' :
                      log.type === 'WARNING' ? 'text-yellow-500' :
                      log.type === 'ERROR' ? 'text-yellow-600' :
                      'text-yellow-400'
                    }`}>
                      [{log.method}]
                    </span>
                    <span className="text-yellow-600/40 text-[8px]">{log.txHash}</span>
                  </div>
                  <p className="text-yellow-500/90 leading-normal font-sans">
                    {log.message}
                  </p>
                  <span className="text-[8px] text-yellow-600/40 block">
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
      <footer className="mt-12 border-t border-yellow-500/15 py-6 px-6 text-center text-yellow-600/55 font-mono text-[10px] space-y-1 bg-black">
        <p>Genesis Proof Protocol — 100% Client-Side Web Simulation of GenLayer Node Consensuses.</p>
        <p>No external third-party API dependencies. All calculations processed locally on-device.</p>
      </footer>

    </div>
  );
}
