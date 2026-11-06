import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: election, error } = await supabase.from("elections").select("id").eq("status", "open").maybeSingle();
    if (error) throw error;
    if (!election) return NextResponse.json({ election: null });
    const { data: candidates, error: candidatesError } = await supabase.from("candidates").select("id,name,image_url,display_order").eq("election_id", election.id).order("display_order");
    if (candidatesError) throw candidatesError;
    return NextResponse.json({ election: { id: election.id, candidates: candidates ?? [] } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không tải được danh sách." }, { status: 503 });
  }
}
