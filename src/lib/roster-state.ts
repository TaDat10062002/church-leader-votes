import type { CandidateDraft } from "@/lib/types";

export type ProvisionalDraft = {
  id: string;
  originalIndex: number;
  candidate: CandidateDraft;
};

export type DeletedDraft = ProvisionalDraft;

export function createProvisionalDrafts(candidates: CandidateDraft[]): ProvisionalDraft[] {
  return candidates.map((candidate, originalIndex) => ({
    id: globalThis.crypto.randomUUID(),
    originalIndex,
    candidate,
  }));
}

export function removeProvisionalDraft(
  waiting: ProvisionalDraft[],
  deleted: DeletedDraft[],
  id: string,
) {
  const index = waiting.findIndex((draft) => draft.id === id);
  if (index < 0) return { waiting, deleted };

  const removed = waiting[index];
  return {
    waiting: waiting.filter((_, waitingIndex) => waitingIndex !== index),
    deleted: [...deleted, removed].sort((left, right) => left.originalIndex - right.originalIndex),
  };
}

export function restoreProvisionalDraft(
  waiting: ProvisionalDraft[],
  deleted: DeletedDraft[],
  id: string,
) {
  const draft = deleted.find((entry) => entry.id === id);
  if (!draft) return { waiting, deleted };

  return {
    waiting: [...waiting, draft].sort((left, right) => left.originalIndex - right.originalIndex),
    deleted: deleted.filter((entry) => entry.id !== id),
  };
}

export function toCandidateDrafts(drafts: ProvisionalDraft[]): CandidateDraft[] {
  return drafts.map(({ candidate }) => candidate);
}

// Kept for compatibility with the existing roster state contract.
export function removeDraftAt(rows: CandidateDraft[], index: number) {
  if (index < 0 || index >= rows.length) return { rows, deleted: null as { item: CandidateDraft; index: number } | null };
  return { rows: rows.filter((_, rowIndex) => rowIndex !== index), deleted: { item: rows[index], index } };
}

export function undoDraftRemoval(rows: CandidateDraft[], deleted: { item: CandidateDraft; index: number } | null) {
  if (!deleted) return rows;
  const restored = [...rows];
  restored.splice(Math.min(deleted.index, restored.length), 0, deleted.item);
  return restored;
}
