import { NextResponse } from "next/server";
import { getCachedActiveElection } from "@/lib/election-cache";
import { apiError } from "@/lib/http";

export async function GET() {
  try {
    return NextResponse.json(await getCachedActiveElection());
  } catch (error) {
    console.error("Active election load failed", error);
    return apiError("ELECTION_LOAD_FAILED", 503);
  }
}
