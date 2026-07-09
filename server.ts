import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { NFT_Record, ValidatorReport } from './src/types';

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
        description: "Vaguely similar geometric orbits, but using flat raster renderings."
      }
    ],
    audit_history: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score_before: 96,
        score_after: 96,
        findings: "Continuous audit completed. Scanned 4 major NFT marketplaces and Google Images. No earlier visual matches found. Status confirmed as VERIFIED_ORIGINAL.",
        triggered_by: "0x89FdBba77299a9a304859aef901b007ea1221fbc"
      }
    ],
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
    title: "Golden Particle Horizon",
    creator: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a",
    owner: "0x98Be6A611fbc9c72E9D1E842910d55e3477f1E22a",
    description: "A golden, high-contrast digital horizon. Infused with metallic gradients, dynamic particle streams, and slow-motion canvas rotations.",
    media_url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop",
    category: "Digital Art",
    minted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    authenticity_score: 85,
    authenticity_status: "VERIFIED_ORIGINAL",
    similar_works_found: [],
    audit_history: [],
    validators: [
      {
        name: "Scholar AI",
        role: "Prior Art Crawler",
        decision: "APPROVED",
        originalityScore: 88,
        similarityScore: null,
        rationale: "Legitimate registration. The golden particle field is highly distinct.",
        evidenceFound: []
      },
      {
        name: "Legal Counsel AI",
        role: "Jurisdiction & IP Audit",
        decision: "APPROVED",
        originalityScore: 84,
        similarityScore: null,
        rationale: "Artistic claim satisfies the non-obviousness criteria.",
        evidenceFound: []
      },
      {
        name: "Industry Expert AI",
        role: "Style & Authenticity Auditor",
        decision: "APPROVED",
        originalityScore: 83,
        similarityScore: null,
        rationale: "Visually striking styling. High novelty value.",
        evidenceFound: []
      }
    ]
  },
  {
    token_id: "3",
    title: "The Codex of Autonomous Agents",
    creator: "0x55Fd88Cc11Dda77a9a304859aef901b007ea1221",
    owner: "0x33Aa9c72E9D1E842910d55e3477f1E22a1D31Cb8",
    description: "A speculative essay detailing the political economy of networks populated purely by autonomous LLM instances.",
    media_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    category: "Text/Literary",
    minted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authenticity_score: 68,
    authenticity_status: "PROBABLE_ORIGINAL",
    similar_works_found: [
      {
        url: "https://medium.com/autonomous-networks/codex-draft-2025",
        description: "Vaguely similar structural concepts regarding agent economies found in a Medium draft from late 2025."
      }
    ],
    audit_history: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score_before: 82,
        score_after: 68,
        findings: "Re-evaluation flagged semantic matches on public Medium drafts. Status updated to PROBABLE_ORIGINAL.",
        triggered_by: "0xGP_Protocol_v1"
      }
    ],
    validators: [
      {
        name: "Scholar AI",
        role: "Prior Art Crawler",
        decision: "APPROVED",
        originalityScore: 72,
        similarityScore: null,
        rationale: "Contains structured explanations but shows minor overlaps with common terminology.",
        evidenceFound: []
      },
      {
        name: "Legal Counsel AI",
        role: "Jurisdiction & IP Audit",
        decision: "APPROVED",
        originalityScore: 68,
        similarityScore: null,
        rationale: "Approved with cautionary scoring due to generic phrasing in certain paragraphs.",
        evidenceFound: []
      },
      {
        name: "Industry Expert AI",
        role: "Style & Authenticity Auditor",
        decision: "APPROVED",
        originalityScore: 65,
        similarityScore: null,
        rationale: "Novel format of textual presentation, though the concepts are standard across modern AI literature.",
        evidenceFound: []
      }
    ]
  }
];

let nextTokenId = 4;

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
    message: "Protocol constants set: required_mint_fee = 0.05 GETH",
    type: 'INFO'
  }
];

function addLog(method: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO') {
  const hash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
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

app.get('/api/logs', (req, res) => {
  res.json(glvmLogs);
});

// Helper to simulate GenLayer Web Crawl & Consensus Decision deterministically
function runGenLayerConsensusSimulation(
  title: string,
  description: string,
  category: string,
  media_url: string
) {
  const seedVal = (title.length + description.length + category.length) % 30;
  let baseOriginality = 82 + (seedVal % 15); // ranges 82 to 96
  
  const lowercaseTitle = title.toLowerCase();
  const lowercaseDesc = description.toLowerCase();
  const isPlagiarized = lowercaseTitle.includes("copy") || lowercaseTitle.includes("plagiarized") || lowercaseDesc.includes("stolen") || lowercaseDesc.includes("replica");

  if (isPlagiarized) {
    baseOriginality = 25 + (seedVal % 10); // Reject threshold
  }

  const validators: ValidatorReport[] = [
    {
      name: "Scholar AI",
      role: "Prior Art Crawler",
      decision: baseOriginality >= 40 ? 'APPROVED' : 'REJECTED',
      originalityScore: baseOriginality + 1,
      similarityScore: null,
      rationale: baseOriginality >= 40
        ? `Crawl of scientific database indexes, OpenSea, and Rarible APIs showed no pre-existing match for this submission.`
        : `CRITICAL MATCH FOUND: Detected high textual/structural correlation (84%) with pre-existing resources.`,
      evidenceFound: baseOriginality >= 40 ? [] : [{ url: "https://opensea.io/assets/plagiarized-record", description: "Direct similarity overlap discovered in static cache." }]
    },
    {
      name: "Legal Counsel AI",
      role: "Jurisdiction & IP Audit",
      decision: baseOriginality >= 40 ? 'APPROVED' : 'REJECTED',
      originalityScore: baseOriginality - 1,
      similarityScore: null,
      rationale: baseOriginality >= 40
        ? `No statutory blocks found. The claim architecture is clear and satisfies standard requirements.`
        : `Rejection recommended. The core claims are identical to pre-existing works.`,
      evidenceFound: []
    },
    {
      name: "Industry Expert AI",
      role: "Style & Authenticity Auditor",
      decision: baseOriginality >= 40 ? 'APPROVED' : 'REJECTED',
      originalityScore: baseOriginality,
      similarityScore: null,
      rationale: baseOriginality >= 40
        ? `Artistic signature and description are cohesive. High technical quality with distinct characteristics.`
        : `This asset is a duplicate of previously published works. No novelty found.`,
      evidenceFound: []
    }
  ];

  const avgOriginality = Math.round((validators[0].originalityScore + validators[1].originalityScore + validators[2].originalityScore) / 3);

  return {
    validators,
    avgOriginality,
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
    audit_history: [
      {
        timestamp: new Date().toISOString(),
        score_before: simulation.avgOriginality,
        score_after: simulation.avgOriginality,
        findings: `Initial GenLayer verification complete. Status set to ${status}. Agreement reached across all 3 nodes.`,
        triggered_by: "0xGP_Protocol_v1"
      }
    ],
    validators: simulation.validators
  };

  nfts.unshift(newNFT);

  addLog("MINT_NFT", `NFT Minted Successfully! Token ID: ${tokenId} | Status: ${status} | Score: ${simulation.avgOriginality}`, 'SUCCESS');

  res.json({
    success: true,
    token_id: tokenId,
    nft: newNFT
  });
});

// 2. AUDIT PROVENANCE
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
  const isBadAudit = Math.random() > 0.85 || nft.title.toLowerCase().includes("decay") || nft.description.toLowerCase().includes("decay");
  const freshScore = isBadAudit ? Math.floor(20 + Math.random() * 20) : Math.floor(88 + Math.random() * 12);
  const oldScore = nft.authenticity_score;
  const decayedScore = Math.round(oldScore * 0.7 + freshScore * 0.3);

  // Status transitions
  let finalStatus = nft.authenticity_status;
  let findings = `Continuous search evaluated. Fresh consensus score is ${freshScore}. Decayed average: ${decayedScore}. No conflicting claims.`;

  if (decayedScore < 40) {
    finalStatus = "DISPUTED";
    findings = `CRITICAL ALERT: Audit score dropped below threshold (Score: ${decayedScore}). High correlation of copycat activities detected.`;
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

// 3. TRANSFER NFT
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

  addLog("TRANSFER_NFT", `NFT #${token_id} manually transferred from ${caller} to ${to}. Creator/provenance history preserved.`, 'SUCCESS');

  res.json({ success: true, nft });
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
