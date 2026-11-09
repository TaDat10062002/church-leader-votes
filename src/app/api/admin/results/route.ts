import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase";
import { aggregateResults } from "@/lib/results";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const supabase = getSupabaseAdmin();
    const { data: election, error } = await supabase.from("elections").select("id").eq("status", "opened").maybeSingle();
    if (error) throw error;
    if (!election) return NextResponse.json({ election: null, results: [] });
    const { data: candidates, error: candidateError } = await supabase.from("candidates").select("id,name_zh,name_vi,image_url,display_order").eq("election_id", election.id).order("display_order");
    if (candidateError) throw candidateError;
    const { data: selections, error: selectionError } = await supabase.from("vote_selections").select("candidate_id,votes!inner(election_id)").eq("votes.election_id", election.id);
    if (selectionError) throw selectionError;
    const results = aggregateResults(candidates ?? [], (selections ?? []).map((row) => row.candidate_id));
    return NextResponse.json({ election, results });
  } catch (error) {
    console.error("Election results load failed", error);
    return apiError("RESULTS_LOAD_FAILED", 503);
  }
}
