import type { APassRecord } from "./types";

export interface PreflightInput {
  apass: APassRecord;
  transferCode?: number;
  poolValid?: boolean;
  now?: number;
}

export interface PreflightDecision {
  approved: boolean;
  checks: {
    identity: boolean;
    expiration: boolean;
    assetPolicy: boolean | null;
    poolPolicy: boolean | null;
  };
  reasons: string[];
  credential: { tier: string; group: string; subGroup: string; countries: string[] };
}

export function evaluatePreflight({ apass, transferCode, poolValid, now = Math.floor(Date.now() / 1000) }: PreflightInput): PreflightDecision {
  const checks = {
    identity: apass.status === 1,
    expiration: apass.expirationTime > now,
    assetPolicy: transferCode === undefined ? null : transferCode === 4,
    poolPolicy: poolValid === undefined ? null : poolValid,
  };
  const reasons: string[] = [];
  if (!checks.identity) reasons.push("A-Pass is not active");
  if (!checks.expiration) reasons.push("A-Pass has expired");
  if (checks.assetPolicy === false) reasons.push("Wallet does not satisfy the A-Token policy");
  if (checks.poolPolicy === false) reasons.push("Wallet does not satisfy the CCP pool policy");

  return {
    approved: Object.values(checks).every((value) => value !== false),
    checks,
    reasons,
    credential: { tier: apass.tier, group: apass.group, subGroup: apass.subGroup, countries: apass.countries },
  };
}
