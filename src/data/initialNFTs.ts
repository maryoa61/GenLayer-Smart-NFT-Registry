import { NFT_Record } from '../types';

export const initialNFTs: NFT_Record[] = [
  {
    token_id: "1",
    title: "Ethereal Echoes of Genesis",
    creator: "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd",
    owner: "0x4A7b99c72E9D1E842910d55e3477f1E22a1D31Cd",
    description: "An immersive generative artwork capturing the birth of decentralized consensus. Multi-layered vectors representing independent validator threads reconciling in a single crystalline orbit.",
    media_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    category: "Digital Art",
    minted_at: "2026-06-15T10:30:00.000Z",
    authenticity_score: 96,
    authenticity_status: "VERIFIED_ORIGINAL",
    similar_works_found: [
      {
        url: "https://behance.net/gallery/10928/generative-orbits",
        description: "Vaguely similar geometric orbits, but using flat raster renderings and published post-facto."
      }
    ],
    audit_history: [
      {
        timestamp: "2026-06-30T14:20:00.000Z",
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
    minted_at: "2026-06-20T18:45:00.000Z",
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
    minted_at: "2026-06-25T11:15:00.000Z",
    authenticity_score: 68,
    authenticity_status: "PROBABLE_ORIGINAL",
    similar_works_found: [
      {
        url: "https://medium.com/autonomous-networks/codex-draft-2025",
        description: "Paragraphs 4-12 are nearly identical to a Medium draft posted in late 2025 by a third party."
      }
    ],
    audit_history: [
      {
        timestamp: "2026-06-28T09:00:00.000Z",
        score_before: 82,
        score_after: 68,
        findings: "Re-evaluation flagged semantic matches on public Medium drafts. Status updated to PROBABLE_ORIGINAL.",
        triggered_by: "0x77ff81a299a9a30485aef901b007ea1221fbc44"
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
