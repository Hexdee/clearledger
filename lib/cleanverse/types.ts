export interface CleanverseEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

export interface APassRecord {
  cvRecordId: string;
  subTier: number;
  tier: string;
  status: number;
  expirationTime: number;
  subGroup: string;
  currentKycHash: string;
  group: string;
  countries: string[];
}

export interface ATokenApplication {
  flowType: string;
  requestId: string;
  applyStatus: "PENDING" | "APPROVED" | "ISSUING" | "ISSUED" | "REJECTED" | "ISSUE_FAILED";
  chain: string;
  atokenAddress?: string;
  tokenSymbol?: string;
  tokenName?: string;
  txHash?: string;
  rejectReason?: string;
  issueErrorMsg?: string;
}

export interface ComplianceRule {
  allowed_group: string;
  allowed_sub_group: string;
  min_tier: number;
  min_sub_tier: number;
  is_black_list?: boolean;
  countries?: string[];
}
