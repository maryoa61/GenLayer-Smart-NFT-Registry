import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { NFT_Record, Listing, AuditHistoryEntry, ChallengeHistoryEntry, ValidatorReport } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Ledger State
let nfts: NFT_Record[] = [
  {
    token_id: "1",
    title: "Ethereal Echoes of Genesis",
    creator: "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd",
    owner: "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd",
    description: "An immersive generative artwork capturing the birth of decentralized consensus. Multi-layered vectors representing independent validator threads reconciling in a single crystalline orbit.",
    media_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    category: "Digital Art",
    minted_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    authenticity_score: 96,
    authenticity_status: "VERIFIED_ORIGINAL",
    similar_works_found: [
      {
        url: "https://behance.net/gallery/10928/generative-orbits",
        description: "Vaguely similar geometric orbits, but using flat raster renderings and published post-facto."
      }
    ],
    parent_token_id: null,
    derivative_similarity_score: null,
    royalty_bps_to_parent: 0,
    audit_history: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score_before: 96,
        score_after: 96,
        findings: "Continuous audit completed. Scanned 4 major NFT marketplaces and Google Images. No earlier visual matches found. Status confirmed as VERIFIED_ORIGINAL.",
        triggered_by: "0x89FdBba77299a9a304859aef901b007ea1221fbc"
      }
    ],
    challenge_history: [],
    validators: [
      {
        name: "Scholar AI",
        role: "Prior Art Crawler",
        decision: "APPROVED",
        originalityScore: 97,
        similarityScore: null,
        rationale: "Crawl of Behance, ArtStation, and on-chain registries yielded no prior matches for this specific generative seed. Completely original composition.",
        evidenceFound: []
      },
      {
        name: "Legal Counsel AI",
        role: "Jurisdiction & IP Audit",
        decision: "APPROVED",
        originalityScore: 95,
        similarityScore: null,
        rationale: "Description boundaries are unique and satisfy statutory originality thresholds under non-obviousness guidelines.",
        evidenceFound: []
      },
      {
        name: "Industry Expert AI",
        role: "Style & Authenticity Auditor",
        decision: "APPROVED",
        originalityScore: 96,
        similarityScore: null,
        rationale: "The generative visual signature is novel. Excellent utilization of the canvas. No plagiarism markers found.",
        evidenceFound: []
      }
    ]
  },
  {
    token_id: "2",
    title: "Ethereal Echoes: Golden Remix",
    creator: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a",
    owner: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a",
    description: "A golden, high-contrast reimagining of Ethereal Echoes (#1). Infused with metallic gradients, dynamic particle streams, and slow-motion canvas rotations.",
    media_url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop",
    category: "Digital Art",
    minted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    authenticity_score: 85,
    authenticity_status: "VERIFIED_ORIGINAL",
    similar_works_found: [],
    parent_token_id: "1",
    derivative_similarity_score: 65,
    royalty_bps_to_parent: 650, // 6.5% royalty to parent
    audit_history: [],
    challenge_history: [],
    validators: [
      {
        name: "Scholar AI",
        role: "Prior Art Crawler",
        decision: "APPROVED",
        originalityScore: 88,
        similarityScore: 65,
        rationale: "Perfect alignment as a transformative remix. The golden noise overlay is technically distinct while cleanly preserving the original vector seed of Genesis Proof #1.",
        evidenceFound: []
      },
      {
        name: "Legal Counsel AI",
        role: "Jurisdiction & IP Audit",
        decision: "APPROVED",
        originalityScore: 84,
        similarityScore: 62,
        rationale: "Derivative claims are fully compliant. Royalty rate of 6.5% successfully locked to the parent token creator.",
        evidenceFound: []
      },
      {
        name: "Industry Expert AI",
        role: "Style & Authenticity Auditor",
        decision: "APPROVED",
        originalityScore: 83,
        similarityScore: 68,
        rationale: "Visually striking remix. High quality and clearly acknowledges its lineage. High commercial appeal.",
        evidenceFound: []
      }
    ]
  },
  {
    token_id: "3",
    title: "The Codex of Autonomous Agents",
    creator: "0x55Fd88Cc11Dda77a9a304859aef901b007ea1221",
    owner: "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8",
    description: "A full-length speculative essay detailing the political economy of networks populated purely by autonomous LLM instances.",
    media_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    category: "Text/Literary",
    minted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authenticity_score: 38,
    authenticity_status: "DISPUTED",
    similar_works_found: [
      {
        url: "https://medium.com/autonomous-networks/codex-draft-2025",
        description: "Paragraphs 4-12 are nearly identical to a Medium draft posted in late 2025 by a third party."
      }
    ],
    parent_token_id: null,
    derivative_similarity_score: null,
    royalty_bps_to_parent: 0,
    audit_history: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score_before: 82,
        score_after: 38,
        findings: "Audit triggered by authenticity challenge. Re-evaluation found 45% matching text with pre-existing Medium publication from 2025. Score decayed dynamically.",
        triggered_by: "0x77ff81a299a9a30485aef901b007ea1221fbc44"
      }
    ],
    challenge_history: [
      {
        challenger: "0x77ff81a299a9a30485aef901b007ea1221fbc44",
        evidence_url: "https://medium.com/autonomous-networks/codex-draft-2025",
        explanation: "This paper copies entire sections from my published Medium post of November 2025 without citation or modification.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "DISPUTED",
        resolution: "Upheld in part. Validators reached consensus that substantial textual correlation exists. Status set to DISPUTED. Authenticity score decayed dynamically via 70/30 weight formula."
      }
    ],
    validators: [
      {
        name: "Scholar AI",
        role: "Prior Art Crawler",
        decision: "APPROVED",
        originalityScore: 82,
        similarityScore: null,
        rationale: "Initial audit did not flag the Medium drafts category index due to rate-limiting, but marked the essay structure as well-argued.",
        evidenceFound: []
      },
      {
        name: "Legal Counsel AI",
        role: "Jurisdiction & IP Audit",
        decision: "APPROVED",
        originalityScore: 85,
        similarityScore: null,
        rationale: "Formal claims of authorship were submitted under self-attestation. Approved with standard disclaimers.",
        evidenceFound: []
      },
      {
        name: "Industry Expert AI",
        role: "Style & Authenticity Auditor",
        decision: "APPROVED",
        originalityScore: 80,
        similarityScore: null,
        rationale: "Strong technical prose with applicable frameworks. High reference utility.",
        evidenceFound: []
      }
    ]
  }
];

let nextTokenId = 4;

let listings: Listing[] = [
  {
    token_id: "2",
    seller: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a",
    price: "4.5",
    listed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    active: true
  },
  {
    token_id: "3",
    seller: "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8",
    price: "1.2",
    listed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    active: true
  }
];

// Account Balances & Pending Withdrawals Map
let pendingWithdrawals: Record<string, string> = {
  "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd": "0.0",
  "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a": "0.0",
  "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8": "0.0"
};

// Protocol Fees collected by Contract
let contractTreasury = "0.05";

// Running logs of GenLayer Virtual Machine (GLVM) execution
interface GLVMLog {
  timestamp: string;
  txHash: string;
  method: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
}

let glvmLogs: GLVMLog[] = [
  {
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    txHash: "0x8fa3...b9e2",
    method: "DEPLOY",
    message: "GenesisProof Contract deployed successfully at Address 0xGP_Protocol_v1",
    type: 'SUCCESS'
  },
  {
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    txHash: "0x8fa3...b9e2",
    method: "INIT",
    message: "Protocol constants set: protocol_fee_bps = 250 (2.5%)",
    type: 'INFO'
  }
];

function addLog(method: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO') {
  const hash = '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4);
  glvmLogs.unshift({
    timestamp: new Date().toISOString(),
    txHash: hash,
    method,
    message,
    type
  });
  if (glvmLogs.length > 100) glvmLogs.pop();
}

// REST APIs
app.get('/api/nfts', (req, res) => {
  res.json(nfts);
});

app.get('/api/listings', (req, res) => {
  res.json(listings.filter(l => l.active));
});

app.get('/api/logs', (req, res) => {
  res.json(glvmLogs);
});

app.get('/api/balances/:address', (req, res) => {
  const address = req.params.address;
  const pending = pendingWithdrawals[address] || "0.0";
  res.json({
    address,
    pending_withdrawals: pending
  });
});

app.post('/api/accounts/claim', (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }
  const pending = pendingWithdrawals[address] || "0.0";
  const val = parseFloat(pending);
  if (val <= 0) {
    return res.status(400).json({ error: "No pending funds to withdraw" });
  }

  pendingWithdrawals[address] = "0.0";
  addLog("CLAIM_PROCEEDS", `Account ${address} successfully withdrew ${val} GETH`, 'SUCCESS');
  res.json({ success: true, withdrawn: val.toString() });
});

// Helper to simulate GenLayer Web Crawl & Consensus Decision deterministically
function runGenLayerConsensusSimulation(
  title: string,
  description: string,
  category: string,
  media_url: string,
  parentTokenId: string | null = null
) {
  // We'll generate dynamic scoring based on inputs to make it highly organic and interesting.
  // Seed the generator slightly with length of string to be deterministic yet realistic.
  const seedVal = (title.length + description.length + category.length) % 30;
  
  // Base Originality calculation
  let baseOriginality = 82 + (seedVal % 15); // ranges 82 to 96
  
  // Let's create realistic plagiarisms if user enters specific keywords
  const lowercaseTitle = title.toLowerCase();
  const lowercaseDesc = description.toLowerCase();
  const isPlagiarized = lowercaseTitle.includes("copy") || lowercaseTitle.includes("plagiarized") || lowercaseDesc.includes("stolen") || lowercaseDesc.includes("replica");
  const isSuspicious = lowercaseTitle.includes("remix") && !parentTokenId || lowercaseDesc.includes("similar") || lowercaseTitle.includes("test-suspicious");

  if (isPlagiarized) {
    baseOriginality = 25 + (seedVal % 10); // Reject threshold
  } else if (isSuspicious) {
    baseOriginality = 55 + (seedVal % 10); // Probable original
  }

  // If derivative, similarity score
  let similarityScore: number | null = null;
  if (parentTokenId) {
    // Determine similarity from keywords
    similarityScore = 40 + (seedVal % 45); // 40% to 85% similarity
    if (lowercaseTitle.includes("identical") || lowercaseDesc.includes("exact copy")) {
      similarityScore = 95; // Reject threshold for similarity
    } else if (lowercaseTitle.includes("very different")) {
      similarityScore = 25; // Treat as independent original
    }
  }

  // Formulate 3 mock validator reviews with detailed rationales
  const validators: ValidatorReport[] = [
    {
      name: "Scholar AI",
      role: "Prior Art Crawler",
      decision: baseOriginality >= 40 ? 'APPROVED' : 'REJECTED',
      originalityScore: baseOriginality + 1,
      similarityScore: similarityScore ? Math.min(100, similarityScore + 2) : null,
      rationale: baseOriginality >= 40
        ? `Crawl of scientific database indexes, OpenSea, and Rarible APIs showed no pre-existing match for this submission. Plagiarism index is clean under ${category}.`
        : `CRITICAL MATCH FOUND: Detected high textual/structural correlation (84%) with on-chain metadata records published on an EVM chain in 2024. Non-original content.`,
      evidenceFound: baseOriginality >= 40 ? [] : [{ url: "https://opensea.io/assets/plagiarized-record-2024", description: "Direct visual & description overlap detected on OpenSea static cache." }]
    },
    {
      name: "Legal Counsel AI",
      role: "Jurisdiction & IP Audit",
      decision: baseOriginality >= 40 ? 'APPROVED' : 'REJECTED',
      originalityScore: baseOriginality - 1,
      similarityScore: similarityScore ? Math.max(0, similarityScore - 3) : null,
      rationale: baseOriginality >= 40
        ? `No statutory blocks found under USPTO or WIPO guidelines. The claim architecture is clear and unique. Verified for tokenization.`
        : `Rejection recommended. The core claims are identical to existing foundational assets. Minting would violate anti-plagiarism guidelines.`,
      evidenceFound: []
    },
    {
      name: "Industry Expert AI",
      role: "Style & Authenticity Auditor",
      decision: baseOriginality >= 40 ? 'APPROVED' : 'REJECTED',
      originalityScore: baseOriginality,
      similarityScore: similarityScore,
      rationale: baseOriginality >= 40
        ? `Visual signature and description are cohesive. High technical quality with distinct characteristics.`
        : `This asset is a direct duplicate of previously published works. No novelty found in style or content.`,
      evidenceFound: []
    }
  ];

  const avgOriginality = Math.round((validators[0].originalityScore + validators[1].originalityScore + validators[2].originalityScore) / 3);
  const avgSimilarity = similarityScore !== null
    ? Math.round(((validators[0].similarityScore || 0) + (validators[1].similarityScore || 0) + (validators[2].similarityScore || 0)) / 3)
    : null;

  return {
    validators,
    avgOriginality,
    avgSimilarity,
    isOriginal: avgOriginality >= 40,
  };
}

// 1. MINT NFT
app.post('/api/nfts/mint', (req, res) => {
  const { title, description, media_url, category, creator, fee_sent } = req.body;
  if (!title || !description || !media_url || !category || !creator) {
    return res.status(400).json({ error: "Missing required minting parameters." });
  }

  addLog("MINT_NFT", `Simulating GenLayer multi-agent consensus for: "${title}"`, 'INFO');

  const simulation = runGenLayerConsensusSimulation(title, description, category, media_url);

  // If rejected
  if (!simulation.isOriginal || simulation.avgOriginality < 40) {
    addLog("MINT_NFT", `Mint REJECTED for "${title}". Originality Score (${simulation.avgOriginality}) below threshold. Minting fee refunded to ${creator}`, 'ERROR');
    return res.json({
      success: false,
      status: "REJECTED",
      score: simulation.avgOriginality,
      validators: simulation.validators,
      reason: "Proposed artwork lacks sufficient novelty and conflicts with pre-existing web resources."
    });
  }

  // Mint Success
  const tokenId = (nextTokenId++).toString();
  const status = simulation.avgOriginality >= 85 ? "VERIFIED_ORIGINAL" : "PROBABLE_ORIGINAL";

  const newNFT: NFT_Record = {
    token_id: tokenId,
    creator,
    owner: creator,
    title,
    description,
    media_url,
    category,
    minted_at: new Date().toISOString(),
    authenticity_score: simulation.avgOriginality,
    authenticity_status: status,
    similar_works_found: simulation.avgOriginality >= 85 ? [] : [{ url: "https://google.com/search?q=" + encodeURIComponent(title), description: "Closest matching semantic title patterns discovered." }],
    parent_token_id: null,
    derivative_similarity_score: null,
    royalty_bps_to_parent: 0,
    audit_history: [
      {
        timestamp: new Date().toISOString(),
        score_before: simulation.avgOriginality,
        score_after: simulation.avgOriginality,
        findings: `Initial GenLayer verification complete. Status set to ${status}. Agreement reached across all 3 nodes.`,
        triggered_by: "0xGP_Protocol_v1"
      }
    ],
    challenge_history: [],
    validators: simulation.validators
  };

  nfts.unshift(newNFT);

  // Overpay refund simulation
  const sent = parseFloat(fee_sent || "0.1");
  const required = 0.05;
  if (sent > required) {
    const refund = (sent - required).toFixed(3);
    pendingWithdrawals[creator] = (parseFloat(pendingWithdrawals[creator] || "0.0") + parseFloat(refund)).toFixed(3);
    addLog("MINT_NFT", `Excess fee of ${refund} GETH routed to pending withdrawals for ${creator}`, 'SUCCESS');
  }

  contractTreasury = (parseFloat(contractTreasury) + required).toFixed(3);

  addLog("MINT_NFT", `NFT Minted Successfully! Token ID: ${tokenId} | Status: ${status} | Score: ${simulation.avgOriginality}`, 'SUCCESS');

  res.json({
    success: true,
    token_id: tokenId,
    nft: newNFT
  });
});

// 2. MINT DERIVATIVE
app.post('/api/nfts/mint-derivative', (req, res) => {
  const { parent_token_id, title, description, media_url, creator, fee_sent } = req.body;
  if (!parent_token_id || !title || !description || !media_url || !creator) {
    return res.status(400).json({ error: "Missing required derivative mint parameters." });
  }

  const parentNFT = nfts.find(n => n.token_id === parent_token_id);
  if (!parentNFT) {
    return res.status(400).json({ error: "Parent NFT not found on-chain." });
  }

  addLog("MINT_DERIVATIVE", `Evaluating remix lineage against parent NFT #${parent_token_id}`, 'INFO');

  const simulation = runGenLayerConsensusSimulation(title, description, parentNFT.category, media_url, parent_token_id);

  const avgSimilarity = simulation.avgSimilarity || 50;

  // 1. similarity >= 90 -> Treat as duplicate, reject
  if (avgSimilarity >= 90) {
    addLog("MINT_DERIVATIVE", `Mint REJECTED for "${title}": Duplicate likeness to parent (Similarity: ${avgSimilarity}%). Fee refunded.`, 'ERROR');
    return res.json({
      success: false,
      status: "REJECTED",
      reason: `Proposed derivative is too similar to the parent NFT. Plagiarism threshold (90%) exceeded. Detected ${avgSimilarity}% likeness.`
    });
  }

  // 2. similarity < 30 -> Independent
  const isIndependent = avgSimilarity < 30;
  const tokenId = (nextTokenId++).toString();
  const royaltyBps = isIndependent ? 0 : Math.round(avgSimilarity * 10); // e.g. 50% similarity -> 500 bps (5%)
  const status = simulation.avgOriginality >= 85 ? "VERIFIED_ORIGINAL" : "PROBABLE_ORIGINAL";

  const newNFT: NFT_Record = {
    token_id: tokenId,
    creator,
    owner: creator,
    title,
    description,
    media_url,
    category: parentNFT.category,
    minted_at: new Date().toISOString(),
    authenticity_score: simulation.avgOriginality,
    authenticity_status: status,
    similar_works_found: [],
    parent_token_id: isIndependent ? null : parent_token_id,
    derivative_similarity_score: isIndependent ? null : avgSimilarity,
    royalty_bps_to_parent: royaltyBps,
    audit_history: [
      {
        timestamp: new Date().toISOString(),
        score_before: simulation.avgOriginality,
        score_after: simulation.avgOriginality,
        findings: isIndependent
          ? `GenLayer evaluated claims: Determined work is structurally independent of Parent NFT #${parent_token_id} (Similarity: ${avgSimilarity}% < 30%). Minted as standalone.`
          : `GenLayer Remix authorization: Minted as legitimate derivative of NFT #${parent_token_id}. Locked ${royaltyBps / 100}% royalty share directly to parent creator ${parentNFT.creator}.`,
        triggered_by: "0xGP_Protocol_v1"
      }
    ],
    challenge_history: [],
    validators: simulation.validators
  };

  nfts.unshift(newNFT);

  const sent = parseFloat(fee_sent || "0.1");
  const required = 0.05;
  if (sent > required) {
    const refund = (sent - required).toFixed(3);
    pendingWithdrawals[creator] = (parseFloat(pendingWithdrawals[creator] || "0.0") + parseFloat(refund)).toFixed(3);
  }
  contractTreasury = (parseFloat(contractTreasury) + required).toFixed(3);

  addLog("MINT_DERIVATIVE", `Derivative NFT #${tokenId} minted. Similarity: ${avgSimilarity}% | Royalty: ${royaltyBps / 100}%`, 'SUCCESS');

  res.json({
    success: true,
    token_id: tokenId,
    nft: newNFT
  });
});

// 3. AUDIT PROVENANCE
app.post('/api/nfts/audit', (req, res) => {
  const { token_id, caller } = req.body;
  if (!token_id) {
    return res.status(400).json({ error: "Token ID is required." });
  }

  const nft = nfts.find(n => n.token_id === token_id);
  if (!nft) {
    return res.status(404).json({ error: "NFT not found" });
  }

  addLog("AUDIT_PROVENANCE", `Re-evaluating web registry footprint for NFT #${token_id}`, 'INFO');

  // Simulate a fresh search
  // Random score fluctuate slightly, decay formula: round(old_score * 0.7 + fresh_score * 0.3)
  const isBadAudit = Math.random() > 0.85 || nft.title.toLowerCase().includes("decay") || nft.description.toLowerCase().includes("decay");
  const freshScore = isBadAudit ? Math.floor(20 + Math.random() * 20) : Math.floor(88 + Math.random() * 12);
  const oldScore = nft.authenticity_score;
  const decayedScore = Math.round(oldScore * 0.7 + freshScore * 0.3);

  // Status transitions
  let finalStatus = nft.authenticity_status;
  let findings = `Continuous search evaluated. Fresh consensus score is ${freshScore}. Decayed average: ${decayedScore}. No conflicting claims.`;

  if (decayedScore < 40) {
    finalStatus = "DISPUTED";
    findings = `CRITICAL ALERT: Audit score dropped below threshold (Score: ${decayedScore}). High correlation of copycat activities detected on social feeds.`;
    addLog("AUDIT_PROVENANCE", `WARNING: NFT #${token_id} score dropped below 40. Down-graded to DISPUTED!`, 'WARNING');
  } else if (decayedScore >= 85) {
    finalStatus = "VERIFIED_ORIGINAL";
  } else {
    finalStatus = "PROBABLE_ORIGINAL";
  }

  // Update in state
  nft.authenticity_score = decayedScore;
  nft.authenticity_status = finalStatus;
  nft.audit_history.push({
    timestamp: new Date().toISOString(),
    score_before: oldScore,
    score_after: decayedScore,
    findings,
    triggered_by: caller || "0xAnonymous"
  });

  addLog("AUDIT_PROVENANCE", `Audit Complete for #${token_id}. Current Score: ${decayedScore} | Status: ${finalStatus}`, 'SUCCESS');

  res.json({
    success: true,
    nft
  });
});

// 4. CHALLENGE AUTHENTICITY
app.post('/api/nfts/challenge', (req, res) => {
  const { token_id, challenger, evidence_url, explanation } = req.body;
  if (!token_id || !challenger || !explanation) {
    return res.status(400).json({ error: "Missing required challenge parameters." });
  }

  const nft = nfts.find(n => n.token_id === token_id);
  if (!nft) {
    return res.status(404).json({ error: "NFT not found" });
  }

  addLog("CHALLENGE_AUTHENTICITY", `Active dispute submitted by ${challenger} against NFT #${token_id}`, 'WARNING');

  // Determine outcome based on user-typed explanation
  // If user writes "proof", "steal", "plagiarize", "stolen" or "revoke" -> Revoke!
  const lowerExp = explanation.toLowerCase();
  const lowerUrl = (evidence_url || "").toLowerCase();
  let outcome: 'UPHELD' | 'DISPUTED' | 'REVOKED' = 'DISPUTED';
  let scorePenal = 30;

  if (lowerExp.includes("revoke") || lowerExp.includes("stolen") || lowerExp.includes("stole") || lowerUrl.includes("revoke")) {
    outcome = "REVOKED";
    scorePenal = 90;
  } else if (lowerExp.includes("weak") || lowerExp.includes("dismiss") || lowerExp.includes("unfounded")) {
    outcome = "UPHELD"; // Challenge lacks merit
    scorePenal = 0;
  }

  const oldScore = nft.authenticity_score;
  const newScore = Math.max(0, oldScore - scorePenal);
  let finalStatus = nft.authenticity_status;

  let resolution = "";
  if (outcome === "REVOKED") {
    finalStatus = "REVOKED";
    resolution = `Challenge UPHELD with maximum confidence. Clear prior art verified at ${evidence_url || "provided citation"}. NFT #${token_id} permanently stripped of its authenticity certificate. Marketplace listing banned.`;
    addLog("CHALLENGE_AUTHENTICITY", `CRITICAL: NFT #${token_id} has been permanently REVOKED due to verified plagiarism!`, 'ERROR');
  } else if (outcome === "DISPUTED") {
    finalStatus = "DISPUTED";
    resolution = `Challenge has some technical merit. Correlation confirmed but copyright boundary is ambiguous. Status set to DISPUTED. Authenticity score penalized to ${newScore}.`;
    addLog("CHALLENGE_AUTHENTICITY", `NFT #${token_id} status updated to DISPUTED. Score reduced.`, 'WARNING');
  } else {
    resolution = `Challenge dismissed as unsubstantiated. Evidence at ${evidence_url || "URL"} did not match the claim. Authenticity remains verified.`;
    addLog("CHALLENGE_AUTHENTICITY", `Challenge against NFT #${token_id} dismissed. Status preserved.`, 'SUCCESS');
  }

  nft.authenticity_score = newScore;
  nft.authenticity_status = finalStatus;

  const challengeEntry: ChallengeHistoryEntry = {
    challenger,
    evidence_url: evidence_url || "",
    explanation,
    timestamp: new Date().toISOString(),
    status: outcome,
    resolution
  };

  nft.challenge_history.push(challengeEntry);

  // If revoked, deactivate any active marketplace listing
  if (finalStatus === "REVOKED") {
    listings = listings.map(l => {
      if (l.token_id === token_id) {
        return { ...l, active: false };
      }
      return l;
    });
  }

  res.json({
    success: true,
    nft,
    challengeEntry
  });
});

// 5. TRANSFER NFT
app.post('/api/nfts/transfer', (req, res) => {
  const { token_id, to, caller } = req.body;
  if (!token_id || !to || !caller) {
    return res.status(400).json({ error: "Missing transfer parameters." });
  }

  const nft = nfts.find(n => n.token_id === token_id);
  if (!nft) {
    return res.status(404).json({ error: "NFT not found" });
  }

  if (nft.owner.toLowerCase() !== caller.toLowerCase()) {
    return res.status(403).json({ error: "Caller is not the current token owner." });
  }

  nft.owner = to;
  // Deactivate listing if any
  listings = listings.map(l => {
    if (l.token_id === token_id) return { ...l, active: false };
    return l;
  });

  addLog("TRANSFER_NFT", `NFT #${token_id} manually transferred from ${caller} to ${to}. Creator/provenance history preserved.`, 'SUCCESS');

  res.json({ success: true, nft });
});

// 6. MARKETPLACE: LIST
app.post('/api/marketplace/list', (req, res) => {
  const { token_id, price, seller } = req.body;
  if (!token_id || !price || !seller) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const nft = nfts.find(n => n.token_id === token_id);
  if (!nft) {
    return res.status(404).json({ error: "NFT not found" });
  }

  if (nft.owner.toLowerCase() !== seller.toLowerCase()) {
    return res.status(403).json({ error: "Caller does not own this NFT" });
  }

  if (nft.authenticity_status === "REVOKED") {
    return res.status(400).json({ error: "REVOKED NFTs are banned from the exclusive marketplace." });
  }

  // Remove existing listing if any
  listings = listings.filter(l => l.token_id !== token_id);

  const newListing: Listing = {
    token_id,
    seller,
    price: parseFloat(price).toFixed(3),
    listed_at: new Date().toISOString(),
    active: true
  };

  listings.unshift(newListing);

  addLog("MARKETPLACE_LIST", `NFT #${token_id} listed for sale at ${price} GETH by ${seller}`, 'SUCCESS');

  res.json({ success: true, listing: newListing });
});

// 7. MARKETPLACE: CANCEL
app.post('/api/marketplace/cancel', (req, res) => {
  const { token_id, seller } = req.body;
  if (!token_id || !seller) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const listing = listings.find(l => l.token_id === token_id && l.active);
  if (!listing) {
    return res.status(404).json({ error: "Active listing not found" });
  }

  if (listing.seller.toLowerCase() !== seller.toLowerCase()) {
    return res.status(403).json({ error: "Caller is not the seller" });
  }

  listing.active = false;
  addLog("MARKETPLACE_CANCEL", `Listing for NFT #${token_id} cancelled by seller`, 'INFO');

  res.json({ success: true });
});

// 8. MARKETPLACE: BUY
app.post('/api/marketplace/buy', (req, res) => {
  const { token_id, buyer, amount_sent } = req.body;
  if (!token_id || !buyer || !amount_sent) {
    return res.status(400).json({ error: "Missing buy parameters." });
  }

  const listing = listings.find(l => l.token_id === token_id && l.active);
  if (!listing) {
    return res.status(404).json({ error: "Listing is inactive or does not exist." });
  }

  const nft = nfts.find(n => n.token_id === token_id);
  if (!nft) {
    return res.status(404).json({ error: "NFT not found" });
  }

  const priceVal = parseFloat(listing.price);
  const sentVal = parseFloat(amount_sent);

  if (sentVal < priceVal) {
    return res.status(400).json({ error: `Insufficient funds sent. Required: ${priceVal} GETH` });
  }

  // Deactivate listing
  listing.active = false;

  // Compute splits
  // 1. Protocol Fee (2.5%)
  const protocolFeeBps = 250;
  const feeShare = (priceVal * protocolFeeBps) / 10000;
  contractTreasury = (parseFloat(contractTreasury) + feeShare).toFixed(3);

  // 2. Lineage Royalty Bps check (if derivative)
  let royaltyShare = 0;
  let parentCreator = "";
  if (nft.parent_token_id && nft.royalty_bps_to_parent > 0) {
    const parentNFT = nfts.find(p => p.token_id === nft.parent_token_id);
    if (parentNFT) {
      parentCreator = parentNFT.creator;
      royaltyShare = (priceVal * nft.royalty_bps_to_parent) / 10000;
      pendingWithdrawals[parentCreator] = (parseFloat(pendingWithdrawals[parentCreator] || "0.0") + royaltyShare).toFixed(3);
    }
  }

  // 3. Remainder goes to seller
  const sellerProceeds = priceVal - feeShare - royaltyShare;
  const seller = listing.seller;
  pendingWithdrawals[seller] = (parseFloat(pendingWithdrawals[seller] || "0.0") + sellerProceeds).toFixed(3);

  // 4. Overpay refund goes to buyer
  const overpay = sentVal - priceVal;
  if (overpay > 0) {
    pendingWithdrawals[buyer] = (parseFloat(pendingWithdrawals[buyer] || "0.0") + overpay).toFixed(3);
  }

  // Transfer Ownership
  const oldOwner = nft.owner;
  nft.owner = buyer;

  addLog("MARKETPLACE_BUY", `SOLD! NFT #${token_id} bought by ${buyer}. Price: ${priceVal} GETH. Fee: ${feeShare.toFixed(3)}, Royalty: ${royaltyShare.toFixed(3)} to ${parentCreator || "none"}, Proceeds: ${sellerProceeds.toFixed(3)} to ${seller}`, 'SUCCESS');

  res.json({
    success: true,
    nft,
    splits: {
      price: priceVal,
      fee: feeShare,
      royalty: royaltyShare,
      seller_proceeds: sellerProceeds,
      refund: overpay
    }
  });
});

// Proxy to fetch real-time GenLayer Studio testnet status safely without CORS issues
app.get('/api/genlayer-live-info', async (req, res) => {
  try {
    const response = await fetch('https://studio.genlayer.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    const data = (await response.json()) as any;
    const blockNumberHex = data?.result || '0x0';
    const blockNumberDecimal = parseInt(blockNumberHex, 16);

    const chainResponse = await fetch('https://studio.genlayer.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      })
    });
    const chainData = (await chainResponse.json()) as any;
    const chainIdHex = chainData?.result || '0xf22f';
    const chainIdDecimal = parseInt(chainIdHex, 16);

    res.json({
      status: 'connected',
      block_height: blockNumberDecimal > 0 ? blockNumberDecimal : 842921,
      chain_id: chainIdDecimal > 0 ? chainIdDecimal : 61999,
      rpc_url: 'https://studio.genlayer.com/api'
    });
  } catch (err: any) {
    res.json({
      status: 'offline',
      block_height: 842910,
      chain_id: 61999,
      rpc_url: 'https://studio.genlayer.com/api',
      error: err.message
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Genesis Proof server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
