import { unstable_cache, revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { aggregateResults } from "@/lib/results";
import type { ElectionData } from "@/lib/types";

export const ACTIVE_ELECTION_TAG = "active-election";
export const ELECTION_RESULTS_TAG = "election-results";

// Writes through the app invalidate these snapshots; the TTL covers external changes.
export const getCachedActiveElection = unstable_cache(
  async () => {
    const supabase = getSupabaseAdmin();
    const { data: election, error } = await supabase
      .from("elections")
      .select("id,status,started_at,created_at")
      .order("started_at", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!election) return { election: null };
    if (election.status === "closed") {
      return {
        election: { id: election.id, status: election.status } as ElectionData,
      };
    }
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("id,name_zh,name_vi,image_url,display_order")
      .eq("election_id", election.id)
      .order("display_order");
    if (candidatesError) throw candidatesError;
    return {
      election: {
        id: election.id,
        status: election.status,
        candidates: candidates ?? [],
      } as ElectionData,
    };
  },
  ["active-election-v1"],
  { revalidate: 3600, tags: [ACTIVE_ELECTION_TAG] },
);

// Authentication must be checked by the caller before accessing these results.
export const getCachedElectionResults = unstable_cache(
  async () => {
    const supabase = getSupabaseAdmin();
    const { data: election, error } = await supabase
      .from("elections")
      .select("id")
      .eq("status", "opened")
      .maybeSingle();
    if (error) throw error;
    if (!election) return { election: null, results: [] };
    const [candidateResponse, selectionResponse] = await Promise.all([
      supabase
        .from("candidates")
        .select("id,name_zh,name_vi,image_url,display_order")
        .eq("election_id", election.id)
        .order("display_order"),
      supabase
        .from("vote_selections")
        .select("candidate_id,votes!inner(election_id)")
        .eq("votes.election_id", election.id),
    ]);
    if (candidateResponse.error) throw candidateResponse.error;
    if (selectionResponse.error) throw selectionResponse.error;
    return {
      election,
      results: aggregateResults(
        candidateResponse.data ?? [],
        (selectionResponse.data ?? []).map((row) => row.candidate_id),
      ),
    };
  },
  ["election-results-v1"],
  { revalidate: 3600, tags: [ELECTION_RESULTS_TAG] },
);

// A committed database write must never be reported as failed if invalidation fails.
export function invalidateElectionCache(...tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag);
    } catch (error) {
      console.error(`Cache invalidation failed for ${tag}`, error);
    }
  }
}
