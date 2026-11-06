"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, FileDown, FileSpreadsheet, ImagePlus, LoaderCircle, RotateCcw, Trash2, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CandidateDraft } from "@/lib/types";
import { removeDraftAt, undoDraftRemoval } from "@/lib/roster-state";

export default function ImportRoster() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidates, setCandidates] = useState<CandidateDraft[]>([]);
  const [deleted, setDeleted] = useState<{ item: CandidateDraft; index: number } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function importFile(file?: File) {
    if (!file) return;
    setError(""); setMessage(""); setBusy(true);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/parse-excel", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCandidates(data.candidates); setDeleted(null);
      setMessage(`Đã tải ${data.candidates.length} ứng viên vào danh sách tạm.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Không đọc được file."); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  function remove(index: number) {
    const result = removeDraftAt(candidates, index);
    if (!result.deleted) return;
    setCandidates(result.rows); setDeleted(result.deleted); setMessage(""); setError("");
  }
  function undo() {
    if (!deleted) return;
    setCandidates((rows) => undoDraftRemoval(rows, deleted));
    setDeleted(null);
  }
  async function startElection() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidates }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể bắt đầu kỳ bầu chọn."); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto min-h-dvh max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
    <header className="mb-8 flex items-center justify-between"><a href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink"><ArrowLeft size={17}/>Quản trị</a><span className="rounded-full bg-moss/10 px-3 py-1.5 text-xs font-bold text-moss">BƯỚC 1 · DANH SÁCH ỨNG VIÊN</span></header>
    <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-moss">Chuẩn bị bầu chọn</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Tải danh sách ứng viên</h1><p className="mt-3 text-ink/60">Danh sách vẫn là bản tạm cho đến khi bạn bấm bắt đầu. Hãy kiểm tra ảnh và họ tên trước khi công bố.</p></div>
    <Card className="mt-8 p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-ink"><FileSpreadsheet size={22}/></div><div><h2 className="font-semibold">Import file Excel</h2><p className="mt-1 text-sm text-ink/55">File .xlsx có cột “Họ tên” và “Hình ảnh” (ảnh nhúng hoặc URL).</p></div></div><input ref={inputRef} className="sr-only" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => importFile(e.target.files?.[0])}/><div className="flex flex-col gap-2 sm:flex-row"><a href="/api/admin/template" download className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/40 hover:bg-moss/5"><FileDown size={17}/>Tải Excel mẫu</a><Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}><Upload size={17}/>{busy ? "Đang xử lý…" : "Chọn file Excel"}</Button></div></div>
      <div className="mt-5 rounded-xl border border-dashed border-ink/15 bg-cream/70 px-4 py-5 text-center text-sm text-ink/55 sm:py-7">Hình ảnh nhúng trong Excel sẽ được tải lên Supabase khi bắt đầu kỳ bầu chọn.</div>
    </Card>
    {(message || error || deleted) && <div className={`mt-5 flex flex-col gap-3 rounded-xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${error ? "bg-red-50 text-red-700" : "bg-moss/10 text-moss"}`} role={error ? "alert" : "status"}><span>{error || message || "Đã xóa ứng viên khỏi danh sách tạm."}</span>{deleted && !error && <Button variant="ghost" className="min-h-9 self-start px-2" onClick={undo}><RotateCcw size={15}/>Hoàn tác</Button>}</div>}
    <section className="mt-8"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-ink">Danh sách tạm</h2><p className="mt-1 text-sm text-ink/55">Ứng viên được lưu vào database sau khi bắt đầu.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-ink/65"><Users size={16}/>{candidates.length} ứng viên</span></div>
      {candidates.length === 0 ? <Card className="grid min-h-52 place-items-center border-dashed p-7 text-center shadow-none"><div><ImagePlus className="mx-auto text-moss/50" size={32}/><p className="mt-3 font-medium">Chưa có ứng viên</p><p className="mt-1 text-sm text-ink/50">Chọn file Excel để xem danh sách tại đây.</p></div></Card> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{candidates.map((candidate, index) => <Card key={`${candidate.name}-${index}`} className="group relative p-3 text-center transition duration-200 hover:scale-[1.025] sm:p-4"><button aria-label={`Xóa ${candidate.name}`} onClick={() => remove(index)} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink/45 shadow-sm transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button><img src={candidate.image} alt="" className="mx-auto h-20 w-20 rounded-full border-4 border-cream object-cover sm:h-24 sm:w-24"/><p className="mt-3 line-clamp-2 min-h-10 font-semibold text-ink">{candidate.name}</p><span className="mt-2 inline-flex items-center gap-1 text-xs text-moss"><Check size={13}/>Bản tạm</span></Card>)}</div>}
    </section>
    <div className="sticky bottom-3 z-10 mt-8 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-cream/95 p-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="px-2 text-sm text-ink/60">{candidates.length ? `${candidates.length} ứng viên sẽ được công bố.` : "Import danh sách trước khi bắt đầu."}</p><Button className="w-full sm:w-auto" onClick={startElection} disabled={busy || candidates.length === 0}>{busy ? <LoaderCircle className="animate-spin" size={17}/> : <Check size={17}/>}Bắt đầu bầu chọn</Button></div>
  </main>;
}
