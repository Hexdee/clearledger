import { NextResponse } from "next/server";
import { z } from "zod";
import { getCleanverseClient } from "@/lib/cleanverse/server";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

const bodySchema = z.object({ address: z.string().min(20), chain: z.string().optional(), atoken: z.string().optional() });

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const config = getCleanverseConfig();
    const atoken = body.atoken ?? config.CLEANVERSE_ATOKEN_ADDRESS;
    if (!atoken) return NextResponse.json({ error: "CLEANVERSE_ATOKEN_ADDRESS is not configured yet." }, { status: 409 });
    return NextResponse.json(await getCleanverseClient().verifyApass(body.chain ?? config.CLEANVERSE_CHAIN, atoken, body.address));
  } catch (error) {
    const message = error instanceof Error ? error.message : "A-Pass verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
