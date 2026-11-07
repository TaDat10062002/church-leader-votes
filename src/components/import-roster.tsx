"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, Check, FileDown, FileSpreadsheet, ImagePlus, LoaderCircle, RotateCcw, Trash2, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassHeader } from "@/components/ui/glass-header";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CandidateDraft } from "@/lib/types";
import {
  createProvisionalDrafts,
  removeProvisionalDraft,
  restoreProvisionalDraft,
  toCandidateDrafts,
  type DeletedDraft,
  type ProvisionalDraft,
} from "@/lib/roster-state";

type RosterState = { waiting: ProvisionalDraft[]; deleted: DeletedDraft[] };

export default function ImportRoster() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [roster, setRoster] = useState<RosterState>({ waiting: [], deleted: [] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function importFile(file?: File) {
    if (!file) return;
    setError(""); setMessage(""); setBusy(true);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/parse-excel", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRoster({ waiting: createProvisionalDrafts(data.candidates as CandidateDraft[]), deleted: [] });
      setMessage(`Đã tải ${data.candidates.length} ứng viên vào danh sách tạm.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không đọc được file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    setRoster((current) => removeProvisionalDraft(current.waiting, current.deleted, id));
    setMessage(""); setError("");
  }

  function restore(id: string) {
    setRoster((current) => restoreProvisionalDraft(current.waiting, current.deleted, id));
  }

  async function startElection() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ candidates: toCandidateDrafts(roster.waiting) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể bắt đầu kỳ bầu chọn.");
    } finally {
      setBusy(false);
    }
  }

  const { waiting, deleted } = roster;

  return <main className="mx-auto min-h-dvh max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
    <GlassHeader className="mb-8 flex items-center justify-between"><a href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink"><ArrowLeft size={17}/>Quản trị</a><span className="glass-chip rounded-full bg-moss/10 px-3 py-1.5 text-xs font-bold text-moss">BƯỚC 1 · DANH SÁCH ỨNG VIÊN</span></GlassHeader>
    <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-moss">Chuẩn bị bầu chọn</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Tải danh sách ứng viên</h1><p className="mt-3 text-ink/60">Danh sách vẫn là bản tạm cho đến khi bạn bấm bắt đầu. Hãy kiểm tra ảnh và họ tên trước khi công bố.</p></div>
    <Card className="mt-8 p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-ink"><FileSpreadsheet size={22}/></div><div><h2 className="font-semibold">Import file Excel</h2><p className="mt-1 text-sm text-ink/65">File .xlsx có cột “Họ tên” và “Hình ảnh” (ảnh nhúng hoặc URL).</p></div></div><input ref={inputRef} className="sr-only" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => importFile(e.target.files?.[0])}/><div className="flex flex-col gap-2 sm:flex-row"><a href="/api/admin/template" download className="glass-chip inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/30 px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/40 hover:bg-moss/5"><FileDown size={17}/>Tải Excel mẫu</a><Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}><Upload size={17}/>{busy ? "Đang xử lý…" : "Chọn file Excel"}</Button></div></div>
      <div className="glass-chip mt-5 rounded-xl border border-dashed border-moss/25 bg-white/15 px-4 py-5 text-center text-sm text-ink/65 sm:py-7">Hình ảnh nhúng trong Excel sẽ được tải lên Supabase khi bắt đầu kỳ bầu chọn.</div>
    </Card>
    {(message || error) && <div className={`glass-chip mt-5 rounded-xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-moss/10 text-moss"}`} role={error ? "alert" : "status"}>{error || message}</div>}
    <section className="mt-8"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-ink">Danh sách chờ</h2><p className="mt-1 text-sm text-ink/65">Ứng viên được lưu vào database sau khi bắt đầu.</p></div><div className="flex flex-wrap items-center gap-2"><Sheet><SheetTrigger asChild><Button variant="secondary" aria-label={`Xem ứng viên đã xóa, ${deleted.length} ứng viên`}><RotateCcw size={16}/>Xem ứng viên đã xóa <span className="glass-chip rounded-full bg-moss/10 px-2 py-0.5 text-xs text-moss">{deleted.length}</span></Button></SheetTrigger><SheetContent side="right" aria-describedby="deleted-candidates-description"><SheetHeader><SheetTitle>Ứng viên đã xóa</SheetTitle><SheetDescription id="deleted-candidates-description">Khôi phục riêng từng ứng viên để đưa họ trở lại danh sách chờ.</SheetDescription></SheetHeader>{deleted.length === 0 ? <div className="glass-chip grid min-h-48 place-items-center rounded-xl border border-dashed border-moss/25 bg-white/20 px-5 text-center text-sm text-ink/65">Chưa có ứng viên nào bị xóa.</div> : <ul className="flex flex-col gap-3">{deleted.map((draft) => <li key={draft.id} className="glass-chip flex items-center gap-3 rounded-xl border border-white/70 p-3"><img src={draft.candidate.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover"/><span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{draft.candidate.name}</span><Button variant="secondary" className="shrink-0 px-3" aria-label={`Khôi phục ${draft.candidate.name}`} onClick={() => restore(draft.id)}><RotateCcw size={15}/>Khôi phục</Button></li>)}</ul>}</SheetContent></Sheet><span className="glass-chip inline-flex items-center gap-2 rounded-full bg-white/35 px-3 py-2 text-sm text-ink/65"><Users size={16}/>{waiting.length} ứng viên</span></div></div>
      {waiting.length === 0 ? <Card className="grid min-h-52 place-items-center border-dashed p-7 text-center shadow-none"><div><ImagePlus className="mx-auto text-moss/50" size={32}/><p className="mt-3 font-medium">Chưa có ứng viên</p><p className="mt-1 text-sm text-ink/65">Chọn file Excel để xem danh sách tại đây.</p></div></Card> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{waiting.map((draft) => <Card key={draft.id} className="group relative p-3 text-center transition duration-200 hover:scale-[1.025] sm:p-4"><Button variant="ghost" aria-label={`Xóa ${draft.candidate.name}`} onClick={() => remove(draft.id)} className="absolute right-2 top-2 grid size-11 min-h-0 place-items-center rounded-full bg-white/40 p-0 text-ink/65 shadow-sm transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></Button><img src={draft.candidate.image} alt="" className="mx-auto h-20 w-20 rounded-full border-4 border-cream object-cover sm:h-24 sm:w-24"/><p className="mt-3 line-clamp-2 min-h-10 font-semibold text-ink">{draft.candidate.name}</p><span className="mt-2 inline-flex items-center gap-1 text-xs text-moss"><Check size={13}/>Bản tạm</span></Card>)}</div>}
    </section>
    <Card refract className="sticky bottom-3 z-10 mt-8 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="px-2 text-sm text-ink/60">{waiting.length ? `${waiting.length} ứng viên sẽ được công bố.` : "Import danh sách trước khi bắt đầu."}{deleted.length > 0 ? ` ${deleted.length} ứng viên đã xóa.` : ""}</p><DialogPrimitive.Root open={confirmOpen} onOpenChange={setConfirmOpen}><DialogPrimitive.Trigger asChild><Button className="w-full sm:w-auto" disabled={busy || waiting.length === 0}>{busy ? <LoaderCircle className="animate-spin" size={17}/> : <Check size={17}/>}Bắt đầu bầu chọn</Button></DialogPrimitive.Trigger><DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-xs"/><DialogPrimitive.Content asChild className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 text-ink shadow-xl outline-none"><Card tint={0.04} className="glass-overlay-panel"><DialogPrimitive.Title className="text-xl font-semibold">Xác nhận bắt đầu bầu cử</DialogPrimitive.Title><DialogPrimitive.Description className="mt-3 text-sm leading-6 text-ink/65">Bạn sắp công bố danh sách gồm {waiting.length} ứng viên và cho phép cử tri bắt đầu bỏ phiếu. Bạn có muốn tiếp tục không?</DialogPrimitive.Description><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><DialogPrimitive.Close asChild><Button variant="secondary">Hủy</Button></DialogPrimitive.Close><DialogPrimitive.Close asChild><Button onClick={startElection}>Xác nhận bắt đầu</Button></DialogPrimitive.Close></div></Card></DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root></Card>
  </main>;
}
