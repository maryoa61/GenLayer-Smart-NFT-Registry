import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('GEMINI_API_KEY is not defined in environment variables.');
  }
} catch (error) {
  console.error('Error initializing Gemini SDK:', error);
}

// In-memory Patent/IP NFT Database
interface ValidatorReport {
  name: string;
  role: string;
  decision: 'APPROVED' | 'REJECTED';
  noveltyScore: number;
  inventiveScore: number;
  utilityScore: number;
  rationale: string;
  priorArtReferences: string[];
}

interface PatentNFT {
  id: string;
  title: string;
  creator: string;
  category: string;
  abstract: string;
  claims: string;
  supportingUrl: string;
  mintedAt: string;
  status: 'APPROVED' | 'REJECTED' | 'DISPUTED' | 'REVOKED';
  tier: 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';
  averageScore: number;
  certificateStyle: {
    bgGradient: string;
    borderColor: string;
    glowColor: string;
  };
  validators: ValidatorReport[];
  challenges: {
    challenger: string;
    challengerExplanation: string;
    challengeUrl: string;
    timestamp: string;
    resolution?: string;
  }[];
}

const initialPatents: PatentNFT[] = [
  {
    id: "GL-NFT-001",
    title: "Quantum-Resistant Decentralized Multi-Party Computation Identity Wallet",
    creator: "Dr. Alice Vance",
    category: "Cryptography & Identity",
    abstract: "A novel protocol combining lattices with decentralized multi-party computation (MPC) to establish a keyless, post-quantum secure cryptographic wallet. Shards of the private keys are mathematically proved to never exist on any single device, using multi-source zero-knowledge proofs.",
    claims: "1. A method for post-quantum secure distributed threshold signature generation.\n2. Verification of state transitions using lattice-based zero-knowledge proofs over public ledgers.\n3. Dynamic shard reshuffling via an interactive verifiable secret sharing scheme.",
    supportingUrl: "https://arxiv.org/abs/crypto-mpc-identity-quantum",
    mintedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "APPROVED",
    tier: "GOLD",
    averageScore: 94,
    certificateStyle: {
      bgGradient: "from-slate-900 via-indigo-950 to-purple-950",
      borderColor: "border-indigo-500",
      glowColor: "rgba(99, 102, 241, 0.4)"
    },
    validators: [
      {
        name: "Scholar AI",
        role: "Academic & Prior Art Examiner",
        decision: "APPROVED",
        noveltyScore: 95,
        inventiveScore: 92,
        utilityScore: 90,
        rationale: "This protocol successfully addresses the threshold secret-sharing vulnerabilities under quantum computing threats by adopting lattice schemes (specifically Kyber/Saber-like parameters). Prior art search did not reveal any active decentralized identity models merging MPC reshuffling with active lattice structures in production.",
        priorArtReferences: ["NIST Post-Quantum Cryptography Standardization", "Threshold Cryptography with Lattices (IEEE 2024)"]
      },
      {
        name: "Legal Counsel AI",
        role: "Patent Legal Advisor",
        decision: "APPROVED",
        noveltyScore: 94,
        inventiveScore: 95,
        utilityScore: 92,
        rationale: "The claims are highly structured and satisfy statutory patentability criteria: novelty, non-obviousness, and industrial utility. Claim 1 defines a highly technical transition step that represents a major leap over standard Shamir secret sharing which is vulnerable to active adversaries.",
        priorArtReferences: ["US Patent US11823901B2 - Threshold Signature Management"]
      },
      {
        name: "Industry Expert AI",
        role: "Systems Architect & Feasibility Auditor",
        decision: "APPROVED",
        noveltyScore: 92,
        inventiveScore: 94,
        utilityScore: 98,
        rationale: "The architecture offers outstanding performance. With the rising threat of quantum decryptors, this identity architecture has immediate, critical commercial application in institutional custody and secure state networks. It's fully compatible with standard Web3 interfaces.",
        priorArtReferences: []
      }
    ],
    challenges: []
  },
  {
    id: "GL-NFT-002",
    title: "Self-Healing Bio-Polymer Solar Film coating",
    creator: "Julian Thorne",
    category: "Materials Science & CleanTech",
    abstract: "A sprayable polymer coating containing vascularized micro-capsules filled with conductive organic solar polymers. When micro-fractures occur due to physical damage or weathering, the capsules rupture, polymerizing and restoring solar energy transmission within seconds.",
    claims: "1. A dynamic self-healing photovoltaic polymer containing dispersed liquid conductive monomer complexes.\n2. A micro-vascular matrix embedded in synthetic elastomer sheets configured to heal conductive micro-lines.",
    supportingUrl: "https://nature.org/materials-solar-selfhealing-coating",
    mintedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "APPROVED",
    tier: "SILVER",
    averageScore: 83,
    certificateStyle: {
      bgGradient: "from-emerald-950 via-teal-950 to-slate-900",
      borderColor: "border-emerald-500",
      glowColor: "rgba(16, 185, 129, 0.4)"
    },
    validators: [
      {
        name: "Scholar AI",
        role: "Academic & Prior Art Examiner",
        decision: "APPROVED",
        noveltyScore: 85,
        inventiveScore: 80,
        utilityScore: 88,
        rationale: "Self-healing elastomers are well-documented (e.g., White et al., 2001). However, encapsulating active conductive photopolymers within vascularized structures to restore electricity generation represents a clear novel development. Prior works only healed physical structure, not photovoltaic continuity.",
        priorArtReferences: ["Autonomic healing of polymer composites (Nature 2001)", "Flexible photovoltaic skin developments"]
      },
      {
        name: "Legal Counsel AI",
        role: "Patent Legal Advisor",
        decision: "APPROVED",
        noveltyScore: 82,
        inventiveScore: 78,
        utilityScore: 82,
        rationale: "The claims overlap slightly with broad self-healing polymer patents but the specificity of solar conductive microcapsules is sufficiently distinct. Recommend granting the patent with modified claim boundaries limiting scope to photovoltaic restoration.",
        priorArtReferences: ["US Patent US9276492 - Self-healing conductive coatings"]
      },
      {
        name: "Industry Expert AI",
        role: "Systems Architect & Feasibility Auditor",
        decision: "APPROVED",
        noveltyScore: 80,
        inventiveScore: 85,
        utilityScore: 89,
        rationale: "Manufacturing micro-capsules at this scale is expensive but highly feasible. Implementing this on solar arrays in extreme desert climates would reduce maintenance overheads by up to 40%, generating substantial industrial value.",
        priorArtReferences: []
      }
    ],
    challenges: []
  }
];

let patentsDatabase = [...initialPatents];

// --- API Endpoints ---

// Get all patents
app.get('/api/patents', (req, res) => {
  res.json(patentsDatabase);
});

// Register and evaluate patent with GenLayer Consensus
app.post('/api/patents/register', async (req, res) => {
  const { title, creator, category, abstract, claims, supportingUrl } = req.body;

  if (!title || !creator || !category || !abstract || !claims) {
    return res.status(400).json({ error: 'All fields except supporting URL are required.' });
  }

  const simulatedPatentId = `GL-NFT-${Math.floor(100 + Math.random() * 900)}`;

  if (!ai) {
    // Fail-safe fall-back in case Gemini API key is missing (generate mock realistic result)
    console.warn('Gemini API is not configured. Simulating consensus offline.');
    const scores = [80 + Math.floor(Math.random() * 15), 78 + Math.floor(Math.random() * 17), 82 + Math.floor(Math.random() * 15)];
    const avg = Math.round((scores[0] + scores[1] + scores[2]) / 3);
    const tier = avg >= 90 ? 'GOLD' : avg >= 80 ? 'SILVER' : 'BRONZE';
    const isApproved = avg >= 75;

    const offlinePatent: PatentNFT = {
      id: simulatedPatentId,
      title,
      creator,
      category,
      abstract,
      claims,
      supportingUrl: supportingUrl || "",
      mintedAt: new Date().toISOString(),
      status: isApproved ? 'APPROVED' : 'REJECTED',
      tier: isApproved ? tier : 'NONE',
      averageScore: avg,
      certificateStyle: getCertificateStyle(tier, isApproved),
      validators: [
        {
          name: "Scholar AI",
          role: "Academic & Prior Art Examiner",
          decision: isApproved ? "APPROVED" : "REJECTED",
          noveltyScore: scores[0],
          inventiveScore: scores[1] - 3,
          utilityScore: scores[2] - 2,
          rationale: "Evaluation conducted offline. The abstract shows solid integration of concepts with no obvious pre-existing combinations detected in the standard baseline domain. Uniqueness criteria matched successfully.",
          priorArtReferences: ["Simulated Baseline Archive Vol 4", "Internet Standards Draft 2026"]
        },
        {
          name: "Legal Counsel AI",
          role: "Patent Legal Advisor",
          decision: isApproved ? "APPROVED" : "REJECTED",
          noveltyScore: scores[0] - 2,
          inventiveScore: scores[1],
          utilityScore: scores[2] - 4,
          rationale: "Offline legal analysis finds that the claims meet standard statutory subject matter under 35 U.S.C. 101. No identical claim structures are flagged. Fully patentable under standard GenLayer guidelines.",
          priorArtReferences: []
        },
        {
          name: "Industry Expert AI",
          role: "Systems Architect & Feasibility Auditor",
          decision: isApproved ? "APPROVED" : "REJECTED",
          noveltyScore: scores[0] - 4,
          inventiveScore: scores[1] - 1,
          utilityScore: scores[2],
          rationale: "The proposed dynamic implementation is technically feasible and addresses a substantial engineering bottle-neck, representing concrete industrial utility.",
          priorArtReferences: []
        }
      ],
      challenges: []
    };

    patentsDatabase.unshift(offlinePatent);
    return res.json(offlinePatent);
  }

  try {
    // Call Gemini API with Google Search Grounding to simulate web lookup + intelligent consensus
    const prompt = `
You are acting as the decentralized GenLayer Validator consensus network. 
A user has submitted an Invention / Patent application to be evaluated and minted as an Intellectual Property Smart NFT.
Under GenLayer consensus rules, you must run 3 independent Validator roles, fetch information about potential prior art from the web, and output their evaluations and a final consensus decision.

SUBMISSION DETAILS:
- Title: ${title}
- Creator: ${creator}
- Category: ${category}
- Abstract: ${abstract}
- Claims: ${claims}
- Supporting URL/References: ${supportingUrl || "None provided"}

You MUST provide a detailed output representing the 3 independent validators:
1. Validator 1: "Scholar AI" (Academic & Prior Art Examiner)
2. Validator 2: "Legal Counsel AI" (Patent Legal Advisor)
3. Validator 3: "Industry Expert AI" (Systems Architect & Feasibility Auditor)

For each validator, you must:
- Analyze if similar inventions exist on the web (use your search grounding to look up recent, real technologies).
- Give a decision ("APPROVED" or "REJECTED"). Note: To be approved, an invention must be truly novel, non-obvious, and have utility.
- Assign a score (1 to 100) for: Novelty, Inventive Step (Non-obviousness), and Industrial Applicability (Utility).
- Write a 2-3 sentence rationale in Persian or English (technical Persian mixed with English terms is preferred, since the user asked in Persian, but the registry itself is international. Keep it elegant, authentic, and detailed).
- Cite real or highly realistic prior art papers, websites, or patents found during search grounding.

Then calculate the CONSENSUS outcome:
- If at least 2 out of 3 validators APPROVED, the patent is "APPROVED". Average score determines the Tier:
  - Avg >= 90: "GOLD" Tier (Extremely innovative, pristine claims, highly secure/impactful)
  - Avg >= 80 and < 90: "SILVER" Tier (High novelty, clear inventive step, strong utility)
  - Avg >= 70 and < 80: "BRONZE" Tier (Solid utility and novelty, minor overlaps)
  - Avg < 70: "REJECTED" (Major prior art found, too obvious, or lacks utility)
- If consensus is APPROVED, decide on the dynamic Visual Certificate Style (border color and premium gradients representing its tier).

Return the response STRICTLY as a single JSON object. Do not include any markdown or backticks (unless required by MIME type). Match this exact JSON structure:
{
  "status": "APPROVED" | "REJECTED",
  "tier": "GOLD" | "SILVER" | "BRONZE" | "NONE",
  "averageScore": number,
  "certificateStyle": {
    "bgGradient": "string (e.g. from-slate-900 via-indigo-950 to-purple-950)",
    "borderColor": "string (e.g. border-indigo-500)",
    "glowColor": "string (e.g. rgba(99, 102, 241, 0.4))"
  },
  "validators": [
    {
      "name": "Scholar AI",
      "role": "Academic & Prior Art Examiner",
      "decision": "APPROVED" | "REJECTED",
      "noveltyScore": number,
      "inventiveScore": number,
      "utilityScore": number,
      "rationale": "string in Persian or English",
      "priorArtReferences": ["string"]
    },
    ... (repeat for Legal Counsel AI and Industry Expert AI)
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text || '';
    const parsedData = JSON.parse(resultText);

    // Build the final NFT record
    const newPatent: PatentNFT = {
      id: simulatedPatentId,
      title,
      creator,
      category,
      abstract,
      claims,
      supportingUrl: supportingUrl || "",
      mintedAt: new Date().toISOString(),
      status: parsedData.status || 'REJECTED',
      tier: parsedData.status === 'APPROVED' ? (parsedData.tier || 'BRONZE') : 'NONE',
      averageScore: parsedData.averageScore || 50,
      certificateStyle: parsedData.status === 'APPROVED' ? parsedData.certificateStyle : {
        bgGradient: "from-zinc-900 via-stone-900 to-zinc-950",
        borderColor: "border-red-500",
        glowColor: "rgba(239, 68, 68, 0.2)"
      },
      validators: parsedData.validators || [],
      challenges: []
    };

    // Store in our local "blockchain ledger"
    patentsDatabase.unshift(newPatent);
    res.json(newPatent);

  } catch (error: any) {
    console.error('Error executing GenLayer AI Consensus:', error);
    res.status(500).json({ error: 'Failed to run AI consensus engine.', details: error.message });
  }
});

// Challenge an existing patent
app.post('/api/patents/challenge', async (req, res) => {
  const { id, challenger, challengerExplanation, challengeUrl } = req.body;

  if (!id || !challenger || !challengerExplanation) {
    return res.status(400).json({ error: 'Patent ID, challenger name, and explanation are required.' });
  }

  const patentIndex = patentsDatabase.findIndex(p => p.id === id);
  if (patentIndex === -1) {
    return res.status(404).json({ error: 'Patent NFT not found.' });
  }

  const patent = patentsDatabase[patentIndex];

  if (!ai) {
    // Offline simulation of challenge validation
    const offlineChallenge = {
      challenger,
      challengerExplanation,
      challengeUrl: challengeUrl || "",
      timestamp: new Date().toISOString(),
      resolution: "The GenLayer validators evaluated the challenge. Although some prior art was referenced, the patent claims were successfully defended by modifying the scope. Patent remains valid but status set to DISPUTED."
    };
    patent.status = 'DISPUTED';
    patent.challenges.push(offlineChallenge);
    return res.json(patent);
  }

  try {
    // Challenge validation on-chain via GenLayer AI Validators
    const prompt = `
You are running a GenLayer Patent Revocation/Challenge smart contract function.
A citizen has submitted a formal challenge against an approved Patent NFT on our network, claiming it violates novelty or includes undocumented prior art.

PATENT TO RE-EVALUATE:
- Title: ${patent.title}
- Original Creator: ${patent.creator}
- Category: ${patent.category}
- Abstract: ${patent.abstract}
- Claims: ${patent.claims}

CHALLENGE DETAILS:
- Challenger: ${challenger}
- Challenger's Explanation & Evidence: ${challengerExplanation}
- Challenge URL/Link: ${challengeUrl || "None"}

Please simulate the 3 validators ("Scholar AI", "Legal Counsel AI", "Industry Expert AI") re-evaluating the patent in light of the new evidence.
Decide on a consensus resolution:
1. "UPHELD": The challenge lacks merit or doesn't invalidate the patent. Patent remains APPROVED.
2. "DISPUTED / MODIFIED": The challenge has some merit; the patent remains approved but state is changed to DISPUTED.
3. "REVOKED": The challenge provides clear, unarguable prior art. The patent NFT is officially REVOKED.

Return a JSON object with this exact schema:
{
  "newStatus": "APPROVED" | "DISPUTED" | "REVOKED",
  "resolution": "A 3-4 sentence detailed summary in Persian or English explaining the validators' joint consensus on why the patent was upheld, disputed, or revoked, referencing the challenger's links/arguments."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    const newStatus = parsedData.newStatus || 'DISPUTED';
    const resolution = parsedData.resolution || 'Challenge processed successfully.';

    patent.status = newStatus;
    patent.challenges.push({
      challenger,
      challengerExplanation,
      challengeUrl: challengeUrl || "",
      timestamp: new Date().toISOString(),
      resolution
    });

    res.json(patent);
  } catch (error: any) {
    console.error('Error running challenge resolution:', error);
    res.status(500).json({ error: 'Failed to process patent challenge.', details: error.message });
  }
});

// Helper to determine style
function getCertificateStyle(tier: string, isApproved: boolean) {
  if (!isApproved) {
    return {
      bgGradient: "from-zinc-900 via-stone-900 to-zinc-950",
      borderColor: "border-red-500",
      glowColor: "rgba(239, 68, 68, 0.2)"
    };
  }
  switch (tier) {
    case 'GOLD':
      return {
        bgGradient: "from-slate-900 via-indigo-950 to-purple-950",
        borderColor: "border-indigo-500",
        glowColor: "rgba(99, 102, 241, 0.4)"
      };
    case 'SILVER':
      return {
        bgGradient: "from-emerald-950 via-teal-950 to-slate-900",
        borderColor: "border-emerald-500",
        glowColor: "rgba(16, 185, 129, 0.4)"
      };
    case 'BRONZE':
      return {
        bgGradient: "from-amber-950 via-stone-900 to-amber-900",
        borderColor: "border-amber-600",
        glowColor: "rgba(245, 158, 11, 0.3)"
      };
    default:
      return {
        bgGradient: "from-slate-900 to-slate-950",
        borderColor: "border-slate-700",
        glowColor: "rgba(255, 255, 255, 0.1)"
      };
  }
}

// Vite and static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
