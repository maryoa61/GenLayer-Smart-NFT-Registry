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
}

export const translations: Record<'en' | 'fa', TranslationSet> = {
  en: {
    title: "Genesis Proof",
    subtitle: "LAYERED SMART CONTRACTS",
    tagline: "Modular patent registry & multi-agent AI validation split into distinct architectural smart contracts on GenLayer VM.",
    wallet: "Active Wallet Context",
    balances: "Balances",
    blockHeight: "Block Height",
    architecture: "Protocol Architecture",
    upgradability: "Contract Upgradability",
    activeContracts: "Active Smart Contracts",
    contractUpgradeInfo: "Decentralized Orchestrator & Smart Contract Stream (معماری لایه‌بندی‌شده)",
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
    layeredScience: "Layered Design Science (معماری لایه‌بندی‌شده)",
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
    changeLanguage: "Language / زبان",
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
    reAuditFeeWarn: "Gas: 0.05 GETH. Cooldown: 30s"
  },
  fa: {
    title: "جنسیز پروف (Genesis Proof)",
    subtitle: "قراردادهای هوشمند لایه‌بندی شده",
    tagline: "ثبت اختراعات و دارایی‌ها با اعتبارسنجی چندعاملی هوش مصنوعی بر روی ماشین مجازی جن لایر (GenLayer VM).",
    wallet: "کیف پول فعال",
    balances: "موجودی‌ها",
    blockHeight: "ارتفاع بلاک",
    architecture: "معماری پروتکل",
    upgradability: "ارتقاپذیری قرارداد",
    activeContracts: "قراردادهای هوشمند فعال",
    contractUpgradeInfo: "جریان قراردادهای هوشمند لایه‌بندی‌شده جن‌لایر (GenLayer Stream)",
    modularArchDesc: "ارکستراتور ما سه قرارداد هوشمند تخصصی را برای ارتباط متقابل در شبکه آزمایشی جن‌لایر مدیریت می‌کند تا کارمزدها را بهینه و ارتقای توابع ریاضی را ساده کند.",
    registryDesc: "مدیریت ثبت توکن، بررسی‌های هویت فرستنده و فراخوانی مدل‌های اجماع چندعاملی هوش مصنوعی.",
    auditDesc: "مدیریت فرمول کاهش اعتبار ریاضی به مرور زمان، قوانین حل اختلاف و گزارشات بازرسی پیشین.",
    marketplaceDesc: "تسهیل ثبت فروش همتا به همتا، ادعای خرید و توزیع آنی سهم رویالیتی سازنده اثر.",
    contractDetails: "تنظیمات و متغیرهای فعال قرارداد هوشمند",
    decayCoef: "ضریب استهلاک ریاضی (λ)",
    protocolFee: "کارمزد شبیه‌سازی شده پروتکل",
    synced: "وضعیت شبکه: همگام‌سازی شده",
    searchPlaceholder: "جستجوی عنوان، توضیحات یا آدرس سازنده...",
    allCategories: "همه دسته‌بندی‌ها",
    allStatuses: "همه وضعیت‌ها",
    registerBtn: "ثبت دارایی (NFT) جدید",
    authenticityConfidence: "سطح اطمینان از اصالت دارایی",
    reviewConsensus: "بررسی اجماع اعتبارسنج‌ها (قرارداد ۱)",
    reAudit: "حسابرسی مجدد (قرارداد ۲)",
    sellBtn: "فروش (قرارداد ۳)",
    sendBtn: "انتقال",
    buyBtn: "خرید",
    privateAsset: "دارایی خصوصی (قفل شده)",
    layeredScience: "علم طراحی لایه‌بندی شده (معماری لایه‌بندی‌شده)",
    layeredScienceDesc: "با تفکیک قرارداد ثبت اثر، فرمول ریاضی کاهش اعتبار و اقتصاد بازار، یک معماری امن و مقیاس‌پذیر در جن‌لایر ایجاد شده است.",
    ledgerTitle: "دفترکل تراکنش‌های ماشین مجازی جن‌لایر (GLVM)",
    ledgerDesc: "تراکنش‌های نهایی‌شده به صورت آنی توسط نودهای اعتبارسنج هوشمند جن لایر (GenLayer) بررسی و تایید می‌شوند.",
    listAssetTitle: "ثبت برای فروش در بازار (قرارداد ۳)",
    listAssetDesc: "شما در حال ثبت این دارایی برای فروش در بازار هستید. خریداران این دارایی را از طریق قرارداد ۳ تهیه می‌کنند و حق امتیاز سازنده به صورت آنی تقسیم می‌شود.",
    listPriceLabel: "قیمت ثبت فروش (GETH)",
    cancelBtn: "لغو",
    publishListingBtn: "انتشار پیشنهاد فروش",
    transferTitle: "انتقال مالکیت دارایی (NFT)",
    transferDesc: "شما در حال انتقال مستقیم مالکیت این دارایی به آدرس جدید در دفترکل جن لایر هستید.",
    transferTargetLabel: "آدرس مقصد انتقال",
    confirmTransferBtn: "تایید انتقال مالکیت",
    live: "زنده روی شبکه آزمایشی جن لایر",
    standardMintFee: "۰.۰۵ اتر جن‌لایر (مینت استاندارد)",
    highSecondarySplit: "۳۰٪ (سهم رویالیتی بالا)",
    changeLanguage: "زبان / Language",
    activeWallet: "کیف پول فعال",
    contract1Name: "قرارداد ۱: ثبت و اجماع",
    contract2Name: "قرارداد ۲: حسابرسی و اعتبار",
    contract3Name: "قرارداد ۳: بازار و رویالیتی",
    optimisticListing: "در حال ثبت برای فروش در بازار...",
    optimisticBuying: "در حال اجرای خرید و تسهیم سهم...",
    optimisticTransferring: "در حال انتقال مالکیت در دفترکل...",
    optimisticAuditing: "نظرسنجی اجماع نودهای هوش مصنوعی...",
    pendingText: "در انتظار تایید (استخر تراکنش)",
    confirmedText: "تایید شده (بلاک نهایی)",
    cacheHitText: "⚡ اطلاعات در کش محلی (۵۰٪ فراخوانی سریع‌تر)",
    cacheMissText: "🔄 استعلام زنده از دفترکل ثبت اثر",
    prefetchText: "⚡ پیش‌بارگذاری مجاز (کلیک آنی)",
    cooldownText: "محدودیت زمانی فعال است",
    subscribedEventsText: "🟢 اشتراک رویدادهای زنده وب۳ فعال",
    reAuditFeeWarn: "کارمزد: ۰.۰۵ GETH. محدودیت زمانی: ۳۰ ثانیه"
  }
};
