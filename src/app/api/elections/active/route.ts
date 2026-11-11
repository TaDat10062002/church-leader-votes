import { NextResponse } from "next/server";
import { getCachedActiveElection } from "@/lib/election-cache";
import { apiError } from "@/lib/http";

export async function GET() {
  try {
    const start = performance.now();
    const data = await getCachedActiveElection();
    console.log(`[CACHE READ] ${Math.round(performance.now() - start)}ms`);
    return NextResponse.json(await getCachedActiveElection());
  } catch (error) {
    console.error("Active election load failed", error);
    return apiError("ELECTION_LOAD_FAILED", 503);
  }
}
