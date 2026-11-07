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
import { Card } from "@/components/ui/card";
import { GlassSurface } from "@/components/ui/glass";
import { GlassButton } from "@/components/ui/glass-button";
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
    className="min-h-[6.5rem] w-[5.25rem] shrink-0 text-center sm:min-h-0 sm:w-24 lg:w-28"
  >
    <GlassButton variant="icon" tint={0.04}
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Kéo ${candidate.name} vào ô phiếu`}
      aria-describedby="drag-instructions"
      aria-pressed={selected}
      className={`group relative mt-1 inline-flex h-12 w-12 touch-pan-x items-center justify-center rounded-full outline-none transition hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-moss active:cursor-grabbing sm:h-14 sm:w-14 lg:h-16 lg:w-16 ${selected ? "ring-2 ring-moss ring-offset-2 ring-offset-white/70" : ""}`}
    >
      <img src={candidate.image_url} alt="" className={`h-full w-full rounded-full border-2 object-cover ${selected ? "border-moss" : "border-white shadow-sm"}`}/>
      <span className="glass-chip absolute -bottom-0.5 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-cream bg-moss text-white shadow-sm"><GripVertical size={12} aria-hidden="true"/></span>
      {selected && <span className="glass-chip absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-moss text-white shadow-sm"><Check size={10} aria-hidden="true"/></span>}
      <span className="sr-only">Ứng viên {index + 1}{selected ? ", đã có trong phiếu" : ", giữ và kéo icon vào ô phiếu"}</span>
    </GlassButton>
    <div className="mt-1 min-h-8 w-full break-words text-[11px] font-semibold leading-4 text-ink sm:text-xs lg:text-sm">
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
  return <GlassSurface radius={14} tint={0.04} contentClassName="contents"
    ref={setNodeRef}
    aria-label={`Ô phiếu ${index + 1}${candidate ? `, ${candidate.name}` : ", còn trống"}`}
    aria-roledescription="vùng thả phiếu"
    className={`relative min-h-[4.5rem] min-w-0 rounded-xl border p-1.5 text-left transition sm:min-h-[4.25rem] sm:p-2 lg:min-h-[5.25rem] lg:p-3 ${candidate ? "grid grid-cols-[1rem_minmax(0,1fr)_1.5rem] grid-rows-[auto_auto] items-center gap-x-0.5 gap-y-1 sm:grid-cols-[1.25rem_1.75rem_minmax(0,1fr)_1.5rem] sm:grid-rows-1 sm:gap-x-2 sm:gap-y-0 lg:gap-x-3" : `flex items-center gap-1 sm:gap-2 ${isOver ? "border-moss bg-moss/15 ring-2 ring-moss/35" : dragging ? "border-moss/35 border-dashed bg-moss/[.04]" : "border-ink/15 border-dashed bg-white/15"}`} ${candidate ? "border-moss/35 bg-moss/10" : ""}`}
  >
    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs lg:h-7 lg:w-7 ${candidate ? "col-start-1 row-start-1 bg-moss text-[color:var(--app-on-moss)]" : "bg-ink/5 text-ink/65"}`}>{index + 1}</span>
    {candidate ? <>
      <img src={candidate.image_url} alt="" className="col-start-2 row-start-1 h-6 w-6 shrink-0 rounded-full object-cover sm:h-8 sm:w-8 lg:h-10 lg:w-10"/>
      <span className="col-span-3 col-start-1 row-start-2 min-w-0 whitespace-normal break-words px-0.5 text-[11px] font-semibold leading-4 text-ink sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:px-0 sm:text-xs lg:text-sm">{candidate.name}</span>
      <GlassButton variant="icon" type="button" onClick={onRemove} aria-label={`Xóa ${candidate.name} khỏi ô ${index + 1}`} className="col-start-3 row-start-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink/65 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss sm:col-start-4 sm:h-8 sm:w-8 lg:h-9 lg:w-9"><X size={14}/></GlassButton>
    </> : <span className={`min-w-0 text-xs sm:text-sm ${isOver ? "font-semibold text-moss" : "text-ink/65"}`}>{isOver ? "Thả ứng viên vào đây" : dragging ? "Thả vào ô này" : "Thả ứng viên vào đây"}</span>}
  </GlassSurface>;
}

function DragPreview({ candidate }: { candidate: Candidate }) {
  return <div className="glass-chip h-14 w-14 rounded-full border-2 border-white bg-white/35 shadow-2xl sm:h-16 sm:w-16"><img src={candidate.image_url} alt="" className="h-full w-full rounded-full object-cover"/></div>;
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
    <Card className="mx-auto mt-5 max-w-5xl p-3 sm:mt-7 sm:p-5 lg:max-w-6xl">
      <div className="mb-2 flex items-end justify-between gap-2 lg:mb-3"><div><h2 className="text-sm font-semibold text-ink sm:text-base">Danh sách ứng viên</h2><p className="mt-0.5 text-[11px] text-ink/65 sm:text-xs">Giữ icon tròn rồi kéo xuống phiếu</p></div><span className="text-[10px] text-ink/65 sm:text-xs">Kéo để chọn</span></div>
      <div className="overflow-x-auto overscroll-x-contain px-1 pb-2 pt-1"><div className="flex w-max min-w-full justify-start gap-1 sm:w-full sm:flex-wrap sm:justify-center sm:gap-3 lg:gap-4">{candidates.map((candidate, index) => <DraggableCandidate key={candidate.id} candidate={candidate} index={index} selected={selected.has(candidate.id)}/>)}</div></div>
    </Card>

    <Card className="mx-auto mt-4 max-w-5xl p-3 sm:mt-6 sm:p-5 lg:max-w-6xl lg:p-6">
      <div className="mb-3 flex items-center justify-between gap-2 lg:mb-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-moss sm:text-xs">Phiếu của bạn</p><p className="mt-0.5 text-[11px] text-ink/65 sm:text-sm">Thả icon vào một ô còn trống</p></div><span aria-live="polite" className="glass-chip rounded-full bg-white/35 px-2.5 py-1 text-xs font-bold text-ink sm:px-3 sm:py-1.5 sm:text-sm">{selectedIds.length} / 9</span></div>
      <p id="drag-instructions" className="mb-2 rounded-lg bg-moss/[.04] px-2 py-1.5 text-[10px] leading-4 text-ink/65 sm:text-xs">Kéo icon ở trên xuống ô trống. Bàn phím: Tab đến ứng viên, nhấn Space rồi dùng phím mũi tên.</p>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4">{slots.map((id, index) => <BallotSlot key={index} index={index} candidate={id ? byId.get(id) : undefined} dragging={Boolean(activeCandidate)} onRemove={() => { setSlots((current) => current.map((value, i) => i === index ? null : value)); setError(""); }}/>)}</div>
    </Card>

    <Card refract className="ballot-actions fixed inset-x-3 bottom-3 z-20 p-3 sm:relative sm:inset-auto sm:mx-auto sm:mt-6 sm:max-w-2xl sm:p-4">
      {error && <p role="alert" className="mx-auto mb-2 max-w-3xl rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:mb-3">{error}</p>}
      <div className="mx-auto flex max-w-3xl gap-2 sm:justify-center"><Button variant="secondary" aria-label="Xóa lựa chọn" className="shrink-0" onClick={() => { setSlots(Array(9).fill(null)); setError(""); }} disabled={sending || selectedIds.length === 0}><RotateCcw size={16}/><span className="hidden sm:inline">Xóa lựa chọn</span></Button><Button className="flex-1 sm:flex-none sm:px-10" onClick={submit} disabled={sending || selectedIds.length === 0}>{sending ? <LoaderCircle size={17} className="animate-spin"/> : <Send size={16}/>}Gửi phiếu</Button></div>
    </Card>
    <DragOverlay>{activeCandidate ? <DragPreview candidate={activeCandidate}/> : null}</DragOverlay>
  </DndContext>;
}
