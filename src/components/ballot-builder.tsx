"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter as detectClosestCenter,
  defaultKeyboardCoordinateGetter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, LoaderCircle, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/lib/types";
import { assignCandidateToSlot } from "@/lib/ballot-state";

type Props = {
  candidates: Candidate[];
  error: string;
  setError: (value: string) => void;
  sending: boolean;
  onSubmit: (candidateIds: string[]) => Promise<boolean>;
};

const ballotSlotCollision: CollisionDetection = (args) => detectClosestCenter({
  ...args,
  droppableContainers: args.droppableContainers.filter((container) => String(container.id).startsWith("ballot-slot-")),
});

function DraggableCandidate({ candidate, index, selected }: { candidate: Candidate; index: number; selected: boolean }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });
  return <div
    ref={setNodeRef}
    style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }}
    className="w-[4.5rem] shrink-0 text-center sm:w-[5rem]"
  >
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Kéo ${candidate.name} vào ô phiếu`}
      aria-describedby="drag-instructions"
      aria-pressed={selected}
      className="group relative mt-1 inline-flex h-10 w-10 touch-none items-center justify-center rounded-full outline-none transition hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-moss active:cursor-grabbing sm:h-12 sm:w-12"
    >
      <img src={candidate.image_url} alt="" className={`h-full w-full rounded-full border-2 object-cover ${selected ? "border-moss" : "border-white shadow-sm"}`}/>
      <span className="absolute -bottom-0.5 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-cream bg-moss text-white shadow-sm"><GripVertical size={12} aria-hidden="true"/></span>
      {selected && <span className="absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-moss text-white shadow-sm"><Check size={10} aria-hidden="true"/></span>}
      <span className="sr-only">Ứng viên {index + 1}{selected ? ", đã có trong phiếu" : ", giữ và kéo icon vào ô phiếu"}</span>
    </button>
    <div className="mt-1 line-clamp-2 min-h-6 w-full break-words text-[10px] font-semibold leading-3 text-ink sm:text-[11px] sm:leading-4">
      {candidate.name}
    </div>
  </div>;
}

function BallotSlot({ index, candidate, onRemove, dragging }: { index: number; candidate?: Candidate; onRemove: () => void; dragging: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `ballot-slot-${index}`,
    data: { slotIndex: index },
    disabled: Boolean(candidate),
  });
  return <div
    ref={setNodeRef}
    aria-label={`Ô phiếu ${index + 1}${candidate ? `, ${candidate.name}` : ", còn trống"}`}
    aria-roledescription="vùng thả phiếu"
    className={`relative flex min-h-[3.75rem] min-w-0 items-center gap-1 rounded-xl border p-1.5 text-left transition sm:min-h-[4.25rem] sm:gap-2 sm:p-2 ${candidate ? "border-moss/35 bg-moss/10" : isOver ? "border-moss bg-moss/15 ring-2 ring-moss/35" : dragging ? "border-moss/35 border-dashed bg-moss/[.04]" : "border-ink/15 border-dashed bg-white/60"}`}
  >
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${candidate ? "bg-moss text-white" : "bg-ink/5 text-ink/45"}`}>{index + 1}</span>
    {candidate ? <>
      <img src={candidate.image_url} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover sm:h-8 sm:w-8"/>
      <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-ink sm:text-xs">{candidate.name}</span>
      <button type="button" onClick={onRemove} aria-label={`Xóa ${candidate.name} khỏi ô ${index + 1}`} className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink/45 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss sm:h-8 sm:w-8"><X size={14}/></button>
    </> : <span className={`min-w-0 text-xs sm:text-sm ${isOver ? "font-semibold text-moss" : "text-ink/40"}`}>{isOver ? "Thả ứng viên vào đây" : dragging ? "Thả vào ô này" : "Thả ứng viên vào đây"}</span>}
  </div>;
}

function DragPreview({ candidate }: { candidate: Candidate }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-moss/25 bg-white p-3 shadow-2xl"><img src={candidate.image_url} alt="" className="h-12 w-12 rounded-full object-cover"/><span className="max-w-48 truncate text-sm font-semibold text-ink">{candidate.name}</span></div>;
}

export default function BallotBuilder({ candidates, error, setError, sending, onSubmit }: Props) {
  const [slots, setSlots] = useState<Array<string | null>>(() => Array(9).fill(null));
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: defaultKeyboardCoordinateGetter }),
  );
  const selectedIds = slots.filter((id): id is string => Boolean(id));
  const selected = new Set(selectedIds);
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  function handleDragEnd(event: DragEndEvent) {
    setActiveCandidate(null);
    if (!event.over) return;
    const candidateId = String(event.active.id);
    const targetIndex = Number(event.over.data.current?.slotIndex);
    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex > 8) return;
    const result = assignCandidateToSlot(slots, candidateId, targetIndex);
    if (result.error === "DUPLICATE_CANDIDATE") { setError("Ứng viên này đã có trong phiếu. Mỗi người chỉ được chọn một lần."); return; }
    if (result.error === "SLOT_OCCUPIED") { setError("Ô này đã có ứng viên. Hãy thả vào một ô còn trống."); return; }
    if (result.error) return;
    setSlots(result.slots);
    setError("");
  }

  async function submit() {
    if (!selectedIds.length) { setError("Phiếu hợp lệ cần chọn ít nhất 1 ứng viên, tối đa 9 người và không được trùng."); return; }
    if (await onSubmit(selectedIds)) setSlots(Array(9).fill(null));
  }

  return <DndContext
    sensors={sensors}
    collisionDetection={ballotSlotCollision}
    onDragStart={(event) => { setError(""); setActiveCandidate(event.active.data.current?.candidate ?? null); }}
    onDragCancel={() => setActiveCandidate(null)}
    onDragEnd={handleDragEnd}
  >
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="mb-1.5 flex items-end justify-between gap-2"><div><h2 className="text-sm font-semibold text-ink sm:text-base">Danh sách ứng viên</h2><p className="mt-0.5 text-[11px] text-ink/45 sm:text-xs">Giữ icon tròn rồi kéo xuống phiếu</p></div><span className="text-[10px] text-ink/40 sm:text-xs">Kéo để chọn</span></div>
      <div className="overflow-x-auto overscroll-x-contain pb-1"><div className="flex w-max min-w-full justify-start gap-1 sm:flex-wrap sm:justify-center sm:gap-2">{candidates.map((candidate, index) => <DraggableCandidate key={candidate.id} candidate={candidate} index={index} selected={selected.has(candidate.id)}/>)}</div></div>
    </section>

    <section className="mx-auto mt-3 max-w-5xl rounded-2xl border border-ink/5 bg-white/55 p-2.5 sm:mt-5 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-moss sm:text-xs">Phiếu của bạn</p><p className="mt-0.5 text-[11px] text-ink/50 sm:text-sm">Thả icon vào một ô còn trống</p></div><span aria-live="polite" className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-ink sm:px-3 sm:py-1.5 sm:text-sm">{selectedIds.length} / 9</span></div>
      <p id="drag-instructions" className="mb-2 rounded-lg bg-moss/[.04] px-2 py-1.5 text-[10px] leading-4 text-ink/55 sm:text-xs">Kéo icon ở trên xuống ô trống. Bàn phím: Tab đến ứng viên, nhấn Space rồi dùng phím mũi tên.</p>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">{slots.map((id, index) => <BallotSlot key={index} index={index} candidate={id ? byId.get(id) : undefined} dragging={Boolean(activeCandidate)} onRemove={() => { setSlots((current) => current.map((value, i) => i === index ? null : value)); setError(""); }}/>)}</div>
    </section>

    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-cream/95 p-3 backdrop-blur sm:static sm:mx-auto sm:mt-8 sm:max-w-6xl sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      {error && <p role="alert" className="mx-auto mb-2 max-w-3xl rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:mb-3">{error}</p>}
      <div className="mx-auto flex max-w-3xl gap-2 sm:justify-center"><Button variant="secondary" className="shrink-0" onClick={() => { setSlots(Array(9).fill(null)); setError(""); }} disabled={sending || selectedIds.length === 0}><RotateCcw size={16}/><span className="hidden sm:inline">Xóa lựa chọn</span></Button><Button className="flex-1 sm:flex-none sm:px-10" onClick={submit} disabled={sending || selectedIds.length === 0}>{sending ? <LoaderCircle size={17} className="animate-spin"/> : <Send size={16}/>}Gửi phiếu</Button></div>
    </div>
    <DragOverlay>{activeCandidate ? <DragPreview candidate={activeCandidate}/> : null}</DragOverlay>
  </DndContext>;
}
