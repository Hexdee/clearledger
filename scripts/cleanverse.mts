import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { getAddress, Wallet } from "ethers";
import { z } from "zod";
import { CleanverseClient } from "../lib/cleanverse/client";

nextEnv.loadEnvConfig(process.cwd());

const baseUrl = process.env.CLEANVERSE_API_BASE_URL;
const apiId = process.env.CLEANVERSE_API_ID;
const apiKey = process.env.CLEANVERSE_API_KEY;
if (!baseUrl || !apiId || !apiKey) throw new Error("Missing Cleanverse environment configuration.");
const client = new CleanverseClient({ baseUrl, apiId, apiKey });
const [command, ...args] = process.argv.slice(2);

const ruleSchema = z.object({
  allowed_group: z.string().regex(/^$|^[A-Za-z]{1,2}$/),
  allowed_sub_group: z.string().regex(/^$|^[A-Za-z]{1,2}$/),
  min_tier: z.number().int().nonnegative(),
  min_sub_tier: z.number().int().nonnegative(),
  is_black_list: z.boolean().optional(),
  countries: z.array(z.string().length(2)).optional(),
});

const apassSchema = z.object({
  customerId: z.string().regex(/^[A-Za-z0-9]{12,}$/),
  expirationTime: z.number().int().positive(),
  wallet: z.object({ address: z.string(), chain: z.string() }),
  kycSource: z.string().optional(),
  kycId: z.string().optional(),
  subTier: z.number().int().optional(),
  subGroup: z.string().regex(/^[A-Za-z]{1,2}$/).optional(),
  override: z.boolean().optional(),
  identityDataList: z.array(z.object({
    idType: z.string(), fullName: z.string(), idNumber: z.string().optional(),
    validUntil: z.string().optional(), issuingCountryISO2: z.string().length(2),
  })).optional(),
});

const atokenSchema = z.object({
  chain: z.string(), token_name: z.string(), token_symbol: z.string(), decimals: z.number().int().nonnegative(),
  admin_address: z.string(), rule: ruleSchema, icon: z.string(), callback_url: z.string().url().optional(),
});

const poolSchema = z.object({
  chain: z.string(), contract_address: z.string(), rule: ruleSchema, owner_signature: z.string().optional(),
});

async function payloadFromFile<T>(file: string | undefined, schema: z.ZodType<T>): Promise<T> {
  if (!file) throw new Error("A JSON payload file is required. Start with a template in config/.");
  return schema.parse(JSON.parse(await readFile(file, "utf8")));
}

async function main() {
  switch (command) {
    case "list-atokens": {
      const result = await client.listMyATokens();
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "query-apass": {
      const [address, chain = process.env.CLEANVERSE_CHAIN ?? "monad"] = args;
      if (!address) throw new Error("Usage: pnpm cleanverse query-apass <address> [chain]");
      console.log(JSON.stringify(await client.queryApass(chain, getAddress(address)), null, 2));
      break;
    }
    case "atoken-status": {
      const [requestId] = args;
      if (!requestId) throw new Error("Usage: pnpm cleanverse atoken-status <requestId>");
      console.log(JSON.stringify(await client.queryATokenApplication(requestId), null, 2));
      break;
    }
    case "generate-apass": {
      const payload = await payloadFromFile(args[0], apassSchema);
      payload.wallet.address = getAddress(payload.wallet.address);
      console.log(JSON.stringify(await client.generateApass(payload), null, 2));
      break;
    }
    case "launch-atoken": {
      const payload = await payloadFromFile(args[0], atokenSchema);
      payload.admin_address = getAddress(payload.admin_address);
      console.log(JSON.stringify(await client.launchAToken(payload), null, 2));
      break;
    }
    case "register-pool": {
      const payload = await payloadFromFile(args[0], poolSchema);
      payload.contract_address = getAddress(payload.contract_address);
      if (!payload.owner_signature) {
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
        if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY is required to create the CCP owner signature.");
        payload.owner_signature = await new Wallet(privateKey).signMessage(`${payload.chain}${payload.contract_address}`);
      }
      console.log(JSON.stringify(await client.registerCompliancePool({ ...payload, owner_signature: payload.owner_signature }), null, 2));
      break;
    }
    case "faucet": {
      const [symbol, address, amount, chain = process.env.CLEANVERSE_CHAIN ?? "monad"] = args;
      if (!symbol || !address || !amount) throw new Error("Usage: pnpm cleanverse faucet <symbol> <address> <amount> [chain]");
      console.log(JSON.stringify(await client.requestFaucet(chain, symbol, getAddress(address), amount), null, 2));
      break;
    }
    case "verify-apass": {
      const [address, atoken = process.env.CLEANVERSE_ATOKEN_ADDRESS, chain = process.env.CLEANVERSE_CHAIN ?? "monad"] = args;
      if (!address || !atoken) throw new Error("Address and A-Token address are required.");
      console.log(JSON.stringify(await client.verifyApass(chain, getAddress(atoken), getAddress(address)), null, 2));
      break;
    }
    case "verify-pool": {
      const [contractAddress, userAddress, chain = process.env.CLEANVERSE_CHAIN ?? "monad"] = args;
      if (!contractAddress || !userAddress) throw new Error("Usage: pnpm cleanverse verify-pool <contract> <user> [chain]");
      console.log(JSON.stringify(await client.verifyPool(chain, getAddress(contractAddress), getAddress(userAddress)), null, 2));
      break;
    }
    case "validator-signature": {
      const [contractAddress, chain = process.env.CLEANVERSE_CHAIN ?? "monad"] = args;
      const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
      if (!contractAddress || !privateKey) throw new Error("Contract address and DEPLOYER_PRIVATE_KEY are required.");
      const wallet = new Wallet(privateKey);
      console.log(await wallet.signMessage(`${chain}${getAddress(contractAddress)}`));
      break;
    }
    default:
      console.log("Commands: list-atokens, query-apass, generate-apass, launch-atoken, atoken-status, faucet, register-pool, verify-apass, verify-pool, validator-signature");
  }
}

await main();
