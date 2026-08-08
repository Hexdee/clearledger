import { NextResponse } from "next/server";
import { z } from "zod";
import { getCleanverseClient } from "@/lib/cleanverse/server";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

const bodySchema = z.object({ address: z.string().min(20), chain: z.string().optional() });

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const config = getCleanverseConfig();
    const result = await getCleanverseClient().queryApass(body.chain ?? config.CLEANVERSE_CHAIN, body.address);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "A-Pass query failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
