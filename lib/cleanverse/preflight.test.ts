import { describe, expect, it } from "vitest";
import { evaluatePreflight } from "./preflight";
import type { APassRecord } from "./types";

const activePass: APassRecord = {
  cvRecordId: "record", subTier: 1, tier: "2", status: 1, expirationTime: 2_000,
  subGroup: "invoice-finance", currentKycHash: "hash", group: "business", countries: ["NG"],
};

describe("evaluatePreflight", () => {
  it("approves only when identity, CVA, and CCP checks pass", () => {
    expect(evaluatePreflight({ apass: activePass, transferCode: 4, poolValid: true, now: 1_000 }).approved).toBe(true);
  });

  it("returns audit-friendly reasons for every failed layer", () => {
    const decision = evaluatePreflight({
      apass: { ...activePass, status: 0, expirationTime: 900 }, transferCode: 3, poolValid: false, now: 1_000,
    });
    expect(decision.approved).toBe(false);
    expect(decision.reasons).toEqual([
      "A-Pass is not active", "A-Pass has expired", "Wallet does not satisfy the A-Token policy", "Wallet does not satisfy the CCP pool policy",
    ]);
  });
});
