import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { error } = await getSupabaseAdmin().rpc("reset_election");
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Không thể đặt lại dữ liệu bầu cử. Vui lòng thử lại." },
      { status: 503 },
    );
  }
}
