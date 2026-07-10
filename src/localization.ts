export interface TranslationSet {
  title: string;
  subtitle: string;
  tagline: string;
  wallet: string;
  balances: string;
  blockHeight: string;
  architecture: string;
  upgradability: string;
  activeContracts: string;
  contractUpgradeInfo: string;
  modularArchDesc: string;
  registryDesc: string;
  auditDesc: string;
  marketplaceDesc: string;
  contractDetails: string;
  decayCoef: string;
  protocolFee: string;
  synced: string;
  searchPlaceholder: string;
  allCategories: string;
  allStatuses: string;
  registerBtn: string;
  authenticityConfidence: string;
  reviewConsensus: string;
  reAudit: string;
  sellBtn: string;
  sendBtn: string;
  buyBtn: string;
  privateAsset: string;
  layeredScience: string;
  layeredScienceDesc: string;
  ledgerTitle: string;
  ledgerDesc: string;
  listAssetTitle: string;
  listAssetDesc: string;
  listPriceLabel: string;
  cancelBtn: string;
  publishListingBtn: string;
  transferTitle: string;
  transferDesc: string;
  transferTargetLabel: string;
  confirmTransferBtn: string;
  live: string;
  standardMintFee: string;
  highSecondarySplit: string;
  changeLanguage: string;
  activeWallet: string;
  contract1Name: string;
  contract2Name: string;
  contract3Name: string;
  optimisticListing: string;
  optimisticBuying: string;
  optimisticTransferring: string;
  optimisticAuditing: string;
  pendingText: string;
  confirmedText: string;
  cacheHitText: string;
  cacheMissText: string;
  prefetchText: string;
  cooldownText: string;
  subscribedEventsText: string;
  reAuditFeeWarn: string;
  userModeToggle: string;
  adminModeToggle: string;
  roleSelectorLabel: string;
  adminSectionTitle: string;
  contract1Desc: string;
  contract2Desc: string;
  contract3Desc: string;
}

const englishTranslation: TranslationSet = {
  title: "Genesis Proof",
  subtitle: "LAYERED SMART CONTRACTS",
  tagline: "Modular patent registry & multi-agent AI validation split into distinct architectural smart contracts on GenLayer VM.",
  wallet: "Active Wallet Context",
  balances: "Balances",
  blockHeight: "Block Height",
  architecture: "Protocol Architecture",
  upgradability: "Contract Upgradability",
  activeContracts: "Active Smart Contracts",
  contractUpgradeInfo: "Decentralized Orchestrator & Smart Contract Stream",
  modularArchDesc: "Our orchestrator manages three specialized, inter-communicating contracts on GenLayer testnet to optimize gas, prevent limit issues, and enable instant AI math upgrades.",
  registryDesc: "Handles minting database, caller checks, and triggers AI consensus models.",
  auditDesc: "Manages mathematical Trust Decay, dispute rules, and historic audit updates.",
  marketplaceDesc: "Facilitates peer-to-peer listings, buy claims, and instant creator royalty splits.",
  contractDetails: "Contract Configuration & Rules",
  decayCoef: "Decay Coefficient (λ)",
  protocolFee: "Simulated Protocol Fee",
  synced: "Network state: synced",
  searchPlaceholder: "Search title, description, or creator address...",
  allCategories: "All Categories",
  allStatuses: "All Statuses",
  registerBtn: "Register New NFT",
  authenticityConfidence: "Authenticity Confidence",
  reviewConsensus: "Review Validator Consensus (Contract 1)",
  reAudit: "Re-Audit (Contract 2)",
  sellBtn: "Sell (C3)",
  sendBtn: "Send",
  buyBtn: "Buy",
  privateAsset: "Private Asset (Locked)",
  layeredScience: "Layered Design Science",
  layeredScienceDesc: "By separating Registry, Audit math, and Marketplace economics, we create a secure, upgradable blockchain design that isolates computing spikes.",
  ledgerTitle: "GLVM TRANSACTION LEDGER",
  ledgerDesc: "Executed transactions verified across GenLayer intelligent validator nodes in real-time.",
  listAssetTitle: "List Asset for Sale (Contract 3)",
  listAssetDesc: "You are listing this asset on the market. Buyers will purchase this asset via Contract 3, and royalties will automatically transfer to creator on checkout.",
  listPriceLabel: "Listing Price (GETH)",
  cancelBtn: "Cancel",
  publishListingBtn: "Publish Listing",
  transferTitle: "Transfer NFT Ownership",
  transferDesc: "You are transferring the ownership of this asset to another address on the ledger.",
  transferTargetLabel: "Destination Address (Target)",
  confirmTransferBtn: "Confirm Transfer",
  live: "Live on GenLayer Testnet",
  standardMintFee: "0.05 GETH (Standard Mint)",
  highSecondarySplit: "30% (High secondary split)",
  changeLanguage: "Language / Language",
  activeWallet: "Active Wallet Context",
  contract1Name: "Registry & Consensus",
  contract2Name: "Audit & Reputation",
  contract3Name: "Marketplace & Royalties",
  optimisticListing: "Listing on Marketplace...",
  optimisticBuying: "Executing Purchase Split...",
  optimisticTransferring: "Transferring Provenance...",
  optimisticAuditing: "AI Validator Nodes Consensus Poll...",
  pendingText: "PENDING (MEMPOOL)",
  confirmedText: "CONFIRMED (BLOCKED)",
  cacheHitText: "⚡ Metadata Cached (50% faster RPC)",
  cacheMissText: "🔄 Fresh Web3 Registry Query",
  prefetchText: "⚡ Prefetched State (Instant Click)",
  cooldownText: "Cooldown active",
  subscribedEventsText: "🟢 Web3 Events Subscribed",
  reAuditFeeWarn: "Gas: 0.05 GETH. Cooldown: 30s",
  userModeToggle: "Client App (Regular User)",
  adminModeToggle: "Control Room (Project Manager)",
  roleSelectorLabel: "Interface Role:",
  adminSectionTitle: "PROJECT MANAGEMENT & PARAMETER TUNING",
  contract1Desc: "Secures original authorship metadata. It is highly optimized to protect basic mint variables and prevents storage/memory overhead during registration.",
  contract2Desc: "Calculates the mathematical scoring algorithms. Because this logic is isolated, you can change the formula weight below instantly without touching your NFT registry!",
  contract3Desc: "Processes listings, purchases, and manages royalty transfers. High financial processing volumes are completely sandboxed here, saving protocol resources."
};

export const translations: Record<'en' | 'fa', TranslationSet> = {
  en: englishTranslation,
  fa: englishTranslation
};
