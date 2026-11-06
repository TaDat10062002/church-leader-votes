import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateBallot } from "@/lib/ballot";

const validationMessages: Record<string, string> = {
  BALLOT_EMPTY: "Phiếu hợp lệ cần chọn ít nhất 1 ứng viên.",
  BALLOT_SIZE_INVALID: "Phiếu hợp lệ có từ 1 đến 9 lựa chọn.",
  DUPLICATE_CANDIDATE: "Không được chọn trùng một ứng viên.",
  ELECTION_NOT_OPEN: "Kỳ bầu chọn hiện không mở.",
  CANDIDATE_NOT_IN_ELECTION: "Danh sách lựa chọn không hợp lệ. Hãy tải lại trang.",
};

export async function POST(request: Request) {
  let body: { electionId?: string; candidateIds?: string[] };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu phiếu không hợp lệ." }, { status: 400 }); }
  if (!body.electionId || !Array.isArray(body.candidateIds)) return NextResponse.json({ error: "Dữ liệu phiếu không hợp lệ." }, { status: 400 });
  const invalid = validateBallot(body.candidateIds);
  if (invalid) return NextResponse.json({ error: validationMessages[invalid] }, { status: 400 });
  try {
    const supabase = getSupabaseAdmin();
    const { data: voteId, error } = await supabase.rpc("cast_vote", { p_election_id: body.electionId, p_candidate_ids: body.candidateIds });
    if (error) {
      const message = Object.entries(validationMessages).find(([key]) => error.message.includes(key))?.[1];
      return NextResponse.json({ error: message ?? "Không lưu được phiếu. Vui lòng thử lại." }, { status: message ? 400 : 503 });
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không lưu được phiếu." }, { status: 503 });
  }
}
