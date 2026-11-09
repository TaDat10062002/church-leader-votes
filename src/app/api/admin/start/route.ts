import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
type Draft = { name_zh?: string; name_vi?: string; image?: string };
class StartFailure extends Error {
  constructor(public readonly code: string, public readonly values?: Record<string, unknown>) { super(code); }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  let body: { candidates?: Draft[] };
  try { body = await request.json(); } catch { return apiError("ELECTION_CANDIDATES_INVALID", 400); }
  if (!Array.isArray(body.candidates) || !body.candidates.length || body.candidates.some((c) => typeof c?.name_zh !== "string" || !c.name_zh.trim() || typeof c.name_vi !== "string" || !c.name_vi.trim() || typeof c.image !== "string" || !c.image.trim())) {
    return apiError("ELECTION_CANDIDATE_REQUIRED", 400);
  }

  const supabase = getSupabaseAdmin();
  const uploadedPaths: string[] = [];
  try {
    const rows = [];
    for (const [index, candidate] of body.candidates.entries()) {
      let imageUrl = candidate.image!;
      const match = imageUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/i);
      if (match) {
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length > 5 * 1024 * 1024) throw new StartFailure("IMAGE_TOO_LARGE", { name_zh: candidate.name_zh, name_vi: candidate.name_vi });
        const ext = match[1].split("/")[1].replace("jpeg", "jpg");
        const path = `${randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("candidate-images").upload(path, buffer, { contentType: match[1], upsert: false });
        if (error) throw new Error("IMAGE_UPLOAD_FAILED");
        uploadedPaths.push(path);
        imageUrl = supabase.storage.from("candidate-images").getPublicUrl(path).data.publicUrl;
      } else if (!/^https?:\/\//i.test(imageUrl)) {
        throw new StartFailure("IMAGE_URL_INVALID", { name_zh: candidate.name_zh, name_vi: candidate.name_vi });
      }
      rows.push({ name_zh: candidate.name_zh!.trim(), name_vi: candidate.name_vi!.trim(), image_url: imageUrl, display_order: index + 1 });
    }
    const { data: electionId, error } = await supabase.rpc("start_election", { p_candidates: rows });
    if (error) throw error;
    return NextResponse.json({ ok: true, electionId });
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from("candidate-images").remove(uploadedPaths);
    if (error instanceof StartFailure) return apiError(error.code, 400, error.values);
    const alreadyOpen = error instanceof Error && error.message.includes("ELECTION_ALREADY_OPEN");
    console.error("Election start failed", error);
    return apiError(alreadyOpen ? "ELECTION_ALREADY_OPEN" : "ELECTION_START_FAILED", alreadyOpen ? 400 : 503);
  }
}
