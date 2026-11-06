export type BallotError = "BALLOT_EMPTY" | "BALLOT_SIZE_INVALID" | "DUPLICATE_CANDIDATE" | "CANDIDATE_NOT_IN_ELECTION";

export function validateBallot(candidateIds: unknown, officialCandidateIds?: ReadonlySet<string>): BallotError | null {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) return "BALLOT_EMPTY";
  if (candidateIds.length > 9 || candidateIds.some((id) => typeof id !== "string" || !id)) return "BALLOT_SIZE_INVALID";
  const ids = candidateIds as string[];
  if (new Set(ids).size !== ids.length) return "DUPLICATE_CANDIDATE";
  if (officialCandidateIds && ids.some((id) => !officialCandidateIds.has(id))) return "CANDIDATE_NOT_IN_ELECTION";
  return null;
}
