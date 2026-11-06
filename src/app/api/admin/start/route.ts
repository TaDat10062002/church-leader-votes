import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/http";
import { errorMessage } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
type Draft = { name?: string; image?: string };

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  let body: { candidates?: Draft[] };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Danh sách ứng viên không hợp lệ." }, { status: 400 }); }
  if (!Array.isArray(body.candidates) || !body.candidates.length || body.candidates.some((c) => !c.name?.trim() || !c.image)) {
    return NextResponse.json({ error: "Cần ít nhất một ứng viên có đủ họ tên và hình ảnh." }, { status: 400 });
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
        if (buffer.length > 5 * 1024 * 1024) throw new Error(`Ảnh của ${candidate.name} vượt quá 5 MB.`);
        const ext = match[1].split("/")[1].replace("jpeg", "jpg");
        const path = `${randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("candidate-images").upload(path, buffer, { contentType: match[1], upsert: false });
        if (error) throw error;
        uploadedPaths.push(path);
        imageUrl = supabase.storage.from("candidate-images").getPublicUrl(path).data.publicUrl;
      } else if (!/^https?:\/\//i.test(imageUrl)) {
        throw new Error(`URL hình ảnh của ${candidate.name} không hợp lệ.`);
      }
      rows.push({ name: candidate.name!.trim(), image_url: imageUrl, display_order: index + 1 });
    }
    const { data: electionId, error } = await supabase.rpc("start_election", { p_candidates: rows });
    if (error) throw error;
    return NextResponse.json({ ok: true, electionId });
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from("candidate-images").remove(uploadedPaths);
    const message = errorMessage(error).includes("ELECTION_ALREADY_OPEN") ? "Đang có kỳ bầu chọn mở. Hãy đóng kỳ hiện tại trước." : errorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
