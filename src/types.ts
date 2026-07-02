export interface ValidatorReport {
  name: string;
  role: string;
  decision: 'APPROVED' | 'REJECTED';
  noveltyScore: number;
  inventiveScore: number;
  utilityScore: number;
  rationale: string;
  priorArtReferences: string[];
}

export interface PatentNFT {
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
