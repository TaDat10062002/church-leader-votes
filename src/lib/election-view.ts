import type { ElectionData } from "@/lib/types";

export type ElectionViewStatus = "opened" | "closed" | "unavailable";

export function getElectionViewStatus(election: ElectionData | null): ElectionViewStatus {
  if (!election) return "unavailable";
  return election.status;
}
