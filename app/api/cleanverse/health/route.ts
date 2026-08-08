import { NextResponse } from "next/server";
import { getCleanverseClient } from "@/lib/cleanverse/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getCleanverseClient().listMyATokens(1, 20);
    return NextResponse.json({ ok: true, applicationCount: result.data.total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanverse sandbox health check failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
