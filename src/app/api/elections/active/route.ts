import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { apiError } from "@/lib/http";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: election, error } = await supabase.from("elections")
      .select("id,status,started_at,created_at")
      .order("started_at", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!election) return NextResponse.json({ election: null });
    if (election.status === "closed") {
      return NextResponse.json({ election: { id: election.id, status: election.status } });
    }
    const { data: candidates, error: candidatesError } = await supabase.from("candidates").select("id,name,image_url,display_order").eq("election_id", election.id).order("display_order");
    if (candidatesError) throw candidatesError;
    return NextResponse.json({ election: { id: election.id, status: election.status, candidates: candidates ?? [] } });
  } catch (error) {
    console.error("Active election load failed", error);
    return apiError("ELECTION_LOAD_FAILED", 503);
  }
}
