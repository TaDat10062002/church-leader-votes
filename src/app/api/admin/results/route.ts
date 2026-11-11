import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/http";
import { getCachedElectionResults } from "@/lib/election-cache";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await getCachedElectionResults());
  } catch (error) {
    console.error("Election results load failed", error);
    return apiError("RESULTS_LOAD_FAILED", 503);
  }
}
