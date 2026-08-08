import { randomUUID } from "node:crypto";
import { encryptCleanversePayload } from "./crypto";
import type { APassRecord, ATokenApplication, CleanverseEnvelope, ComplianceRule } from "./types";

interface ClientOptions { baseUrl: string; apiId: string; apiKey: string; }

export class CleanverseApiError extends Error {
  constructor(message: string, public readonly code?: string, public readonly status?: number) { super(message); }
}

export class CleanverseClient {
  constructor(private readonly options: ClientOptions) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<CleanverseEnvelope<T>> {
    const response = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "api-id": this.options.apiId,
        "x-request-id": randomUUID(),
        ...init.headers,
      },
    });
    const result = (await response.json()) as CleanverseEnvelope<T>;
    if (!response.ok || result.code !== "0000") {
      throw new CleanverseApiError(result.message || `Cleanverse request failed (${response.status})`, result.code, response.status);
    }
    return result;
  }

  private encryptedBody(payload: unknown) {
    return JSON.stringify({ data: encryptCleanversePayload(payload, this.options.apiKey) });
  }

  queryApass(chain: string, address: string) {
    return this.request<APassRecord>("/query_apass", { method: "POST", body: JSON.stringify({ chain, address }) });
  }

  verifyApass(chain: string, atoken: string, address: string) {
    return this.request<{ chain: string; atoken: string; address: string; code: number; message: string; magickLink?: string }>("/verify_apass", {
      method: "POST", body: JSON.stringify({ chain, atoken, address }),
    });
  }

  listMyATokens(page = 1, pageSize = 20) {
    return this.request<{ total: number; page: number; pageSize: number; items: ATokenApplication[] }>(`/atoken/list_my_atokens?page=${page}&page_size=${pageSize}`);
  }

  queryATokenApplication(requestId: string) {
    return this.request<ATokenApplication>(`/atoken/query_apply_status/${encodeURIComponent(requestId)}`);
  }

  generateApass(payload: {
    customerId: string; expirationTime: number; wallet: { address: string; chain: string }; kycSource?: string; kycId?: string;
    subTier?: number; subGroup?: string; override?: boolean;
    identityDataList?: Array<{ idType: string; fullName: string; idNumber?: string; validUntil?: string; issuingCountryISO2: string }>;
  }) {
    return this.request<{ customerId: string; cvRecordId: string; tier: string; wallet: Record<string, string> }>("/generate_apass", {
      method: "POST", body: this.encryptedBody(payload),
    });
  }

  launchAToken(payload: {
    chain: string; token_name: string; token_symbol: string; decimals: number; admin_address: string;
    rule: ComplianceRule; icon: string; callback_url?: string;
  }) {
    return this.request<{ requestId: string; issueAssetId: number }>("/atoken/launch", {
      method: "POST", body: this.encryptedBody(payload),
    });
  }

  registerCompliancePool(payload: {
    chain: string; contract_address: string; rule: ComplianceRule; owner_signature: string;
  }) {
    return this.request<{ chain: string; contract_address: string; tx_hash: string }>("/validator/register", {
      method: "POST", body: this.encryptedBody(payload),
    });
  }

  verifyPool(chain: string, contractAddress: string, userAddress: string) {
    return this.request<{ chain: string; contract_address: string; user_address: string; valid: boolean }>("/validator/verify", {
      method: "POST", body: JSON.stringify({ chain, contract_address: contractAddress, user_address: userAddress }),
    });
  }

  requestFaucet(chain: string, symbol: string, depositAddress: string, amount: string) {
    return this.request<{ chain: string; symbol: string; deposit_address: string; amount: string; tx_hash: string }>("/faucet", {
      method: "POST", body: JSON.stringify({ chain, symbol, depositAddress, amount }),
    });
  }
}
