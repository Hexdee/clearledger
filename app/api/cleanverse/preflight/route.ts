import { getAddress } from "ethers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { evaluatePreflight } from "@/lib/cleanverse/preflight";
import { getCleanverseClient } from "@/lib/cleanverse/server";

const bodySchema = z.object({ address: z.string(), chain: z.string().optional() });

export async function POST(request: Request) {
  try {
    const input = bodySchema.parse(await request.json());
    const address = getAddress(input.address);
    const config = getCleanverseConfig();
    const chain = input.chain ?? config.CLEANVERSE_CHAIN;
    const client = getCleanverseClient();
    const apass = await client.queryApass(chain, address);

    const [assetResult, poolResult] = await Promise.all([
      config.CLEANVERSE_ATOKEN_ADDRESS
        ? client.verifyApass(chain, config.CLEANVERSE_ATOKEN_ADDRESS, address)
        : undefined,
      config.CLEAREDGER_CONTRACT_ADDRESS
        ? client.verifyPool(chain, config.CLEAREDGER_CONTRACT_ADDRESS, address)
        : undefined,
    ]);

    return NextResponse.json({
      ...evaluatePreflight({
        apass: apass.data,
        transferCode: assetResult?.data.code,
        poolValid: poolResult?.data.valid,
      }),
      configured: { asset: Boolean(config.CLEANVERSE_ATOKEN_ADDRESS), pool: Boolean(config.CLEAREDGER_CONTRACT_ADDRESS) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compliance preflight failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
