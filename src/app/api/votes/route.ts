import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateBallot } from "@/lib/ballot";
import { apiError } from "@/lib/http";

export async function POST(request: Request) {
  let body: { electionId?: string; candidateIds?: string[] };
  try { body = await request.json(); } catch { return apiError("VOTE_INVALID", 400); }
  if (!body.electionId || !Array.isArray(body.candidateIds)) return apiError("VOTE_INVALID", 400);
  const invalid = validateBallot(body.candidateIds);
  if (invalid) return apiError(invalid, 400);
  try {
    const supabase = getSupabaseAdmin();
    const { data: voteId, error } = await supabase.rpc("cast_vote", { p_election_id: body.electionId, p_candidate_ids: body.candidateIds });
    if (error) {
      const code = ["BALLOT_EMPTY", "BALLOT_SIZE_INVALID", "DUPLICATE_CANDIDATE", "ELECTION_NOT_OPEN", "CANDIDATE_NOT_IN_ELECTION"]
        .find((candidateCode) => error.message.includes(candidateCode));
      return apiError(code ?? "VOTE_SAVE_FAILED", code ? 400 : 503);
    }
    try {
      const notification = await supabase.channel(`election-${body.electionId}`).httpSend(
        "vote-recorded",
        { electionId: body.electionId },
        { timeout: 2500 },
      );
      if (!notification.success) console.error("Realtime vote notification failed", notification.status, notification.error);
    } catch (notificationError) {
      // The vote is already committed; don't tell the voter it failed and risk a duplicate retry.
      console.error("Realtime vote notification failed", notificationError);
    }
    return NextResponse.json({ ok: true, voteId });
  } catch (error) {
    console.error("Vote submission failed", error);
    return apiError("VOTE_SAVE_FAILED", 503);
  }
}
