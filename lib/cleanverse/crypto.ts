import { createCipheriv, createDecipheriv } from "node:crypto";

function decodeKey(encodedKey: string) {
  const key = Buffer.from(encodedKey, "base64");
  if (![16, 24, 32].includes(key.length)) {
    throw new Error(`Cleanverse API key must decode to 16, 24, or 32 bytes; received ${key.length}.`);
  }
  return key;
}

function algorithmFor(key: Buffer) {
  return `aes-${key.length * 8}-cbc`;
}

export function encryptCleanversePayload(payload: unknown, encodedKey: string): string {
  const key = decodeKey(encodedKey);
  const cipher = createCipheriv(algorithmFor(key), key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]).toString("base64");
}

export function decryptCleanversePayload(ciphertext: string, encodedKey: string): unknown {
  const key = decodeKey(encodedKey);
  const decipher = createDecipheriv(algorithmFor(key), key, Buffer.alloc(16));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext);
}
