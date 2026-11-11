import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ACTIVE_ELECTION_TAG, ELECTION_RESULTS_TAG, invalidateElectionCache } from "@/lib/election-cache";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { error } = await getSupabaseAdmin().rpc("reset_election");
    if (error) throw error;
    invalidateElectionCache(ACTIVE_ELECTION_TAG, ELECTION_RESULTS_TAG);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Election reset failed", error);
    return apiError("ELECTION_RESET_FAILED", 503);
  }
}
