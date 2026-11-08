"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Church, LoaderCircle, ShieldCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassHeader } from "@/components/ui/glass-header";
import { GlassChip } from "@/components/ui/glass-chip";
import { glassClassName } from "@/lib/glass-variants";
import BallotBuilder from "@/components/ballot-builder";
import ElectionClosedNotice from "@/components/election-closed-notice";
import { subscribeToElectionChanges } from "@/lib/election-realtime";
import { getElectionViewStatus } from "@/lib/election-view";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { ElectionData } from "@/lib/types";

export default function VotePage() {
  const router = useRouter();
  const [election, setElection] = useState<ElectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const snapshotRequest = useRef(0);
  const electionViewStatus = getElectionViewStatus(election);

  const loadElection = useCallback(async (showLoading: boolean | { nativeEvent: Event } = true) => {
    const requestId = ++snapshotRequest.current;
    if (typeof showLoading === "boolean" ? showLoading : true) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/elections/active", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (requestId !== snapshotRequest.current) return;
      setElection(data.election);
    } catch (e) { setError(e instanceof Error ? e.message : "Không tải được danh sách."); }
    finally { if (requestId === snapshotRequest.current) setLoading(false); }
  }, []);
  useEffect(() => {
    void loadElection();
    const client = getSupabaseBrowser();
    if (!client) return;
    return subscribeToElectionChanges(client, () => { void loadElection(false); });
  }, [loadElection]);

  async function submitVote(candidateIds: string[]) {
    if (!election) return false;
    setSending(true); setError("");
    try {
      const response = await fetch("/api/votes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ electionId: election.id, candidateIds }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.replace("/thanks");
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Không gửi được phiếu. Vui lòng thử lại."); return false; }
    finally { setSending(false); }
  }

  return <main className="mx-auto min-h-dvh max-w-7xl px-3 pb-32 pt-3 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
    <GlassHeader className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
      <a href="/vote" className="flex min-w-[10rem] flex-1 items-center gap-2">
        <GlassChip className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-moss"><Church size={19} aria-hidden="true"/></GlassChip>
        <span><span className="block text-sm font-semibold text-ink">Nhà thờ</span><span className="block text-[11px] text-ink/75">Bầu chọn Ban Điều Hành</span></span>
      </a>
      <a href="/admin" className={glassClassName("clear", "grid size-11 shrink-0 place-items-center rounded-full text-ink/75 hover:text-ink")} aria-label="Trang quản trị"><ShieldCheck size={20} aria-hidden="true"/></a>
    </GlassHeader>
    <section className="mx-auto mt-4 max-w-4xl text-center sm:mt-12">
      <GlassChip className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink sm:text-xs"><Vote size={14} aria-hidden="true"/> Phiếu bầu chọn</GlassChip>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:mt-4 sm:text-4xl lg:text-5xl">Chọn người bạn tín nhiệm</h1>
      <p className="mx-auto mt-1.5 max-w-2xl text-xs leading-5 text-ink/75 sm:mt-3 sm:text-base sm:leading-6">Chạm để chọn từ 1 đến 9 người. Bạn có thể xóa lựa chọn ngay trong phiếu.</p>
    </section>
    {loading ? <Card glassVariant="subtle" role="status" className="mx-auto mt-8 grid min-h-48 max-w-xl place-items-center p-6 text-moss"><LoaderCircle size={28} className="animate-spin" aria-hidden="true"/><span className="sr-only">Đang tải danh sách ứng viên</span></Card> : error && !election ? <Card className="mx-auto mt-8 max-w-xl p-6 text-center"><p role="alert">{error}</p><Button className="mt-4" variant="secondary" onClick={loadElection}>Thử tải lại</Button></Card> : electionViewStatus === "closed" ? <ElectionClosedNotice/> : electionViewStatus === "unavailable" ? <Card className="mx-auto mt-8 max-w-xl p-8 text-center"><GlassChip className="mx-auto grid h-12 w-12 place-items-center rounded-full text-moss"><Vote aria-hidden="true"/></GlassChip><h2 className="mt-4 text-xl font-semibold">Chưa mở kỳ bầu chọn</h2><p className="mt-2 text-sm text-ink/75">Vui lòng chờ ban tổ chức bắt đầu.</p></Card> : election?.status === "opened" ? <BallotBuilder candidates={election.candidates ?? []} error={error} setError={setError} sending={sending} onSubmit={submitVote}/> : null}
  </main>;
}
