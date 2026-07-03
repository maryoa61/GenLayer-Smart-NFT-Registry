export interface AuditHistoryEntry {
  timestamp: string;
  score_before: number;
  score_after: number;
  findings: string;
  triggered_by: string;
}

export interface ChallengeHistoryEntry {
  challenger: string;
  evidence_url: string;
  explanation: string;
  timestamp: string;
  status: 'UPHELD' | 'DISPUTED' | 'REVOKED';
  resolution: string;
}

export interface ValidatorReport {
  name: string;
  role: string;
  decision: 'APPROVED' | 'REJECTED';
  originalityScore: number;
  similarityScore: number | null;
  rationale: string;
  evidenceFound: { url: string; description: string }[];
}

export interface NFT_Record {
  token_id: string;
  creator: string;
  owner: string;
  title: string;
  description: string;
  media_url: string;
  category: string;
  minted_at: string;
  authenticity_score: number;
  authenticity_status: 'VERIFIED_ORIGINAL' | 'PROBABLE_ORIGINAL' | 'UNVERIFIED' | 'DISPUTED' | 'REVOKED';
  similar_works_found: { url: string; description: string }[];
  parent_token_id: string | null;
  derivative_similarity_score: number | null;
  royalty_bps_to_parent: number;
  audit_history: AuditHistoryEntry[];
  challenge_history: ChallengeHistoryEntry[];
  validators?: ValidatorReport[]; // Visual simulation metadata
}

export interface Listing {
  token_id: string;
  seller: string;
  price: string; // in GETH / GLR
  listed_at: string;
  active: boolean;
}

export interface AccountBalance {
  address: string;
  balance: string; // GETH
  pending_withdrawals: string; // for claim_proceeds
}
