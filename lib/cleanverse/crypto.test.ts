import { describe, expect, it } from "vitest";
import { decryptCleanversePayload, encryptCleanversePayload } from "./crypto";

describe("Cleanverse AES-CBC payload encryption", () => {
  it("round-trips UTF-8 JSON with a zero IV", () => {
    const key = Buffer.alloc(32, 7).toString("base64");
    const payload = { chain: "monad", invoice: "INV-CL-001", amount: "10000" };
    const encrypted = encryptCleanversePayload(payload, key);
    expect(encrypted).not.toContain("INV-CL-001");
    expect(decryptCleanversePayload(encrypted, key)).toEqual(payload);
  });

  it("rejects invalid AES key sizes", () => {
    expect(() => encryptCleanversePayload({}, Buffer.alloc(10).toString("base64"))).toThrow(/16, 24, or 32 bytes/);
  });
});
