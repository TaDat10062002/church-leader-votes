"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, LoaderCircle, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassSurface } from "@/components/ui/glass";
import { GlassButton } from "@/components/ui/glass-button";
import type { Candidate } from "@/lib/types";

type Props = {
  candidates: Candidate[];
  error: string;
  setError: (value: string) => void;
  sending: boolean;
  onSubmit: (candidateIds: string[]) => Promise<boolean>;
};

function CandidateOption({
  candidate,
  index,
  slotIndex,
  onSelect,
}: {
  candidate: Candidate;
  index: number;
  slotIndex: number;
  onSelect: () => void;
}) {
  const selected = slotIndex >= 0;

  return <button
    type="button"
    onClick={onSelect}
    disabled={selected}
    aria-pressed={selected}
    aria-label={`${candidate.name}${selected ? `, đã chọn ở vị trí ${slotIndex + 1}` : ", chạm để chọn"}`}
    className={`group flex min-h-[5.25rem] min-w-0 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center outline-none transition active:scale-[.98] focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-100 ${selected ? "border-moss/45 bg-moss/10" : "border-ink/10 bg-white/35 hover:border-moss/40 hover:bg-moss/[.06]"}`}
  >
    <span className="relative block h-10 w-10 shrink-0 sm:h-12 sm:w-12">
      <img src={candidate.image_url} alt="" className={`h-full w-full rounded-full border-2 object-cover ${selected ? "border-moss" : "border-[var(--glass-border)]"}`} />
      <span className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ${selected ? "bg-moss" : "bg-ink/65 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"}`} aria-hidden="true">
        {selected ? slotIndex + 1 : <Check size={11} />}
      </span>
    </span>
    <span className="w-full break-words text-xs font-semibold leading-4 text-ink">{candidate.name}</span>
    <span className="sr-only">Ứng viên {index + 1}{selected ? ", đã có trong phiếu" : ""}</span>
  </button>;
}

function BallotSlot({
  index,
  candidate,
  onRemove,
}: {
  index: number;
  candidate?: Candidate;
  onRemove: () => void;
}) {
  return <GlassSurface
    radius={14}
    tint={0.012}
    contentClassName="contents"
    aria-label={`Ô phiếu ${index + 1}${candidate ? `, ${candidate.name}` : ", còn trống"}`}
    className={`relative flex min-h-[5.25rem] min-w-0 flex-col justify-between rounded-xl border p-1.5 text-left transition sm:min-h-[5.5rem] sm:p-2 ${candidate ? "border-moss/35 bg-moss/10" : "border-ink/15 border-dashed bg-white/15"}`}
  >
    <div className="flex items-center justify-between gap-1">
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${candidate ? "bg-moss text-[color:var(--app-on-moss)]" : "bg-ink/5 text-ink/65"}`}>{index + 1}</span>
      {candidate ? <GlassButton
        variant="icon"
        type="button"
        onClick={onRemove}
        aria-label={`Xóa ${candidate.name} khỏi ô ${index + 1}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/65 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss sm:h-10 sm:w-10"
      ><X size={15} aria-hidden="true" /></GlassButton> : <span className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true" />}
    </div>
    {candidate ? <div className="flex min-w-0 items-center gap-1.5 pb-0.5 sm:gap-2">
      <img src={candidate.image_url} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover sm:h-8 sm:w-8" />
      <span className="min-w-0 break-words text-xs font-semibold leading-4 text-ink">{candidate.name}</span>
    </div> : <span className="pb-1 text-[11px] leading-4 text-ink/55 sm:text-xs">Ô trống</span>}
  </GlassSurface>;
}

export default function BallotBuilder({ candidates, error, setError, sending, onSubmit }: Props) {
  const [slots, setSlots] = useState<Array<string | null>>(() => Array(9).fill(null));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ballotOpen, setBallotOpen] = useState(false);
  const selectedIds = slots.filter((id): id is string => Boolean(id));
  const slotByCandidate = new Map(slots.flatMap((id, index) => id ? [[id, index] as const] : []));
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  function selectCandidate(candidateId: string) {
    if (slotByCandidate.has(candidateId)) return;
    const emptyIndex = slots.findIndex((id) => id === null);
    if (emptyIndex < 0) {
      setError("Phiếu đã đủ 9 ứng viên. Hãy xóa một lựa chọn trong phiếu trước khi chọn thêm.");
      return;
    }
    setSlots((current) => current.map((id, index) => index === emptyIndex ? candidateId : id));
    setError("");
  }

  function requestSubmit() {
    if (!selectedIds.length) { setError("Phiếu hợp lệ cần chọn ít nhất 1 ứng viên, tối đa 9 người và không được trùng."); return; }
    setError("");
    setConfirmOpen(true);
  }

  async function submit() {
    setConfirmOpen(false);
    if (await onSubmit(selectedIds)) setSlots(Array(9).fill(null));
  }

  const selectedNames = selectedIds.map((id) => byId.get(id)?.name).filter((name): name is string => Boolean(name));
  const ballotSlots = slots.map((id, index) => <BallotSlot
    key={index}
    index={index}
    candidate={id ? byId.get(id) : undefined}
    onRemove={() => { setSlots((current) => current.map((value, i) => i === index ? null : value)); setError(""); }}
  />);

  return <>
    <Card className="mx-auto mt-4 max-w-5xl p-2.5 sm:mt-7 sm:p-5 lg:max-w-6xl">
      <div className="mb-2 flex items-end justify-between gap-2 sm:mb-3">
        <div>
          <h2 className="text-sm font-semibold text-ink sm:text-base">Danh sách ứng viên</h2>
          <p className="mt-0.5 text-[11px] text-ink/65 sm:text-xs">Chạm một lần để thêm vào phiếu</p>
        </div>
        <span className="text-[10px] text-ink/65 sm:text-xs">{candidates.length} ứng viên</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-5 lg:gap-3">
        {candidates.map((candidate, index) => <CandidateOption
          key={candidate.id}
          candidate={candidate}
          index={index}
          slotIndex={slotByCandidate.get(candidate.id) ?? -1}
          onSelect={() => selectCandidate(candidate.id)}
        />)}
      </div>
    </Card>

    <Card className="mx-auto mt-3 hidden max-w-5xl p-2.5 sm:mt-6 sm:block sm:p-5 lg:max-w-6xl lg:p-6">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3 lg:mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-moss sm:text-xs">Phiếu của bạn</p>
          <p className="mt-0.5 text-[11px] text-ink/65 sm:text-sm">Chạm dấu × trong phiếu để xóa</p>
        </div>
        <span aria-live="polite" className="glass-chip rounded-full bg-white/35 px-2.5 py-1 text-xs font-bold text-ink sm:px-3 sm:py-1.5 sm:text-sm">{selectedIds.length} / 9</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4">
        {ballotSlots}
      </div>
    </Card>

    <DialogPrimitive.Root open={ballotOpen} onOpenChange={setBallotOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-backdrop fixed inset-0 z-40 sm:hidden" />
        <DialogPrimitive.Content asChild className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-ink shadow-xl outline-none sm:hidden">
          <Card className="glass-overlay-panel">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <DialogPrimitive.Title className="text-base font-semibold">Phiếu của bạn</DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm text-ink/65">Chạm dấu × để bỏ chọn ứng viên.</DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild><GlassButton variant="icon" aria-label="Đóng phiếu"><X size={18} aria-hidden="true" /></GlassButton></DialogPrimitive.Close>
            </div>
            <p aria-live="polite" className="mb-3 text-sm font-semibold text-moss">{selectedIds.length} / 9 ứng viên đã chọn</p>
            <div className="grid grid-cols-3 gap-2">{ballotSlots}</div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="min-h-11 flex-1" onClick={() => { setSlots(Array(9).fill(null)); setError(""); }} disabled={sending || selectedIds.length === 0}><RotateCcw size={16} />Xóa tất cả</Button>
              <DialogPrimitive.Close asChild><Button className="min-h-11 flex-1">Xong</Button></DialogPrimitive.Close>
            </div>
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      <Card refract className="ballot-actions fixed inset-x-2 bottom-2 z-20 p-2.5 pb-[calc(env(safe-area-inset-bottom)+.625rem)] sm:relative sm:inset-auto sm:mx-auto sm:mt-6 sm:max-w-2xl sm:p-4">
        {error && <p role="alert" className="mx-auto mb-2 max-w-3xl rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:mb-3">{error}</p>}
        <div className="mb-2 flex items-center justify-between gap-3 sm:hidden">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink">Phiếu của bạn</p>
            <p aria-live="polite" className="text-sm font-bold text-moss">{selectedIds.length} / 9 đã chọn</p>
          </div>
          <DialogPrimitive.Trigger asChild><Button variant="secondary" className="min-h-11 shrink-0">Xem / sửa phiếu</Button></DialogPrimitive.Trigger>
        </div>
        <div className="mx-auto flex max-w-3xl gap-2 sm:justify-center">
          <Button variant="secondary" aria-label="Xóa lựa chọn" className="hidden min-h-11 shrink-0 sm:inline-flex" onClick={() => { setSlots(Array(9).fill(null)); setError(""); }} disabled={sending || selectedIds.length === 0}><RotateCcw size={16} /><span className="hidden sm:inline">Xóa lựa chọn</span></Button>
          <DialogPrimitive.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button className="min-h-11 w-full sm:w-auto sm:px-10" onClick={requestSubmit} disabled={sending || selectedIds.length === 0}>{sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={16} />}Gửi phiếu</Button>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="modal-backdrop fixed inset-0 z-50" />
              <DialogPrimitive.Content asChild className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 text-ink shadow-xl outline-none">
                <Card className="glass-overlay-panel">
                  <DialogPrimitive.Title className="text-lg font-semibold">Xác nhận gửi phiếu</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-ink/65">Bạn sắp gửi phiếu gồm {selectedIds.length} ứng viên. Sau khi gửi, bạn không thể thay đổi lựa chọn.</DialogPrimitive.Description>
                  <p className="mt-3 rounded-xl bg-moss/[.06] px-3 py-2 text-sm font-medium text-ink">{selectedNames.join(" · ")}</p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <DialogPrimitive.Close asChild><Button variant="secondary" disabled={sending}>Quay lại chỉnh sửa</Button></DialogPrimitive.Close>
                    <Button onClick={() => void submit()} disabled={sending}>{sending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />}Xác nhận gửi</Button>
                  </div>
                </Card>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </Card>
    </DialogPrimitive.Root>
  </>;
}
