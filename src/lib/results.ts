import type { Candidate, ResultRow } from "@/lib/types";

export function aggregateResults(candidates: Candidate[], candidateIds: string[]): ResultRow[] {
  const counts = new Map<string, number>();
  for (const id of candidateIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return candidates.map((candidate) => ({ ...candidate, total: counts.get(candidate.id) ?? 0 }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "vi"));
}

export function shouldRefreshResults(reason: "vote-recorded" | "subscribed" | "focus") {
  return reason === "vote-recorded" || reason === "subscribed" || reason === "focus";
}
