export type BallotDropError = "DUPLICATE_CANDIDATE" | "SLOT_OCCUPIED" | "INVALID_SLOT";

export function assignCandidateToSlot(slots: Array<string | null>, candidateId: string, slotIndex: number) {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 9 || slots.length !== 9) {
    return { slots, error: "INVALID_SLOT" as BallotDropError };
  }
  if (slots.includes(candidateId)) return { slots, error: "DUPLICATE_CANDIDATE" as BallotDropError };
  if (slots[slotIndex]) return { slots, error: "SLOT_OCCUPIED" as BallotDropError };
  return { slots: slots.map((id, index) => index === slotIndex ? candidateId : id), error: null };
}
