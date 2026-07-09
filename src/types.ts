export interface AuditHistoryEntry {
  timestamp: string;
  score_before: number;
  score_after: number;
  findings: string;
  triggered_by: string;
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
  authenticity_status: 'VERIFIED_ORIGINAL' | 'PROBABLE_ORIGINAL' | 'UNVERIFIED' | 'DISPUTED';
  similar_works_found: { url: string; description: string }[];
  audit_history: AuditHistoryEntry[];
  validators?: ValidatorReport[]; // Visual simulation metadata
}
