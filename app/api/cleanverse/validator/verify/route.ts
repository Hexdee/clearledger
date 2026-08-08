import { NextResponse } from "next/server";
import { z } from "zod";
import { getCleanverseClient } from "@/lib/cleanverse/server";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

const bodySchema = z.object({ userAddress: z.string().min(20), contractAddress: z.string().min(20), chain: z.string().optional() });

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const config = getCleanverseConfig();
    return NextResponse.json(await getCleanverseClient().verifyPool(body.chain ?? config.CLEANVERSE_CHAIN, body.contractAddress, body.userAddress));
  } catch (error) {
    const message = error instanceof Error ? error.message : "CCP verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
