import type { CandidateDraft } from "@/lib/types";

export type DeletedDraft = { item: CandidateDraft; index: number };

export function removeDraftAt(rows: CandidateDraft[], index: number) {
  if (index < 0 || index >= rows.length) return { rows, deleted: null as DeletedDraft | null };
  return { rows: rows.filter((_, rowIndex) => rowIndex !== index), deleted: { item: rows[index], index } };
}

export function undoDraftRemoval(rows: CandidateDraft[], deleted: DeletedDraft | null) {
  if (!deleted) return rows;
  const restored = [...rows];
  restored.splice(Math.min(deleted.index, restored.length), 0, deleted.item);
  return restored;
}
