import { describe, expect, it } from "vitest";
import { validateBallot } from "@/lib/ballot";
import { aggregateResults, shouldRefreshResults } from "@/lib/results";
import { assignCandidateToSlot } from "@/lib/ballot-state";

const ids = new Set(Array.from({ length: 10 }, (_, i) => `candidate-${i + 1}`));

describe("ballot validation", () => {
  it("accepts one through nine distinct official candidates", () => {
    expect(validateBallot(["candidate-1"], ids)).toBeNull();
    expect(validateBallot(Array.from(ids).slice(0, 9), ids)).toBeNull();
  });
  it("rejects empty, oversized, duplicate, and unknown selections", () => {
    expect(validateBallot([], ids)).toBe("BALLOT_EMPTY");
    expect(validateBallot(Array.from(ids), ids)).toBe("BALLOT_SIZE_INVALID");
    expect(validateBallot(["candidate-1", "candidate-1"], ids)).toBe("DUPLICATE_CANDIDATE");
    expect(validateBallot(["other"], ids)).toBe("CANDIDATE_NOT_IN_ELECTION");
  });
});

describe("ballot drag-and-drop", () => {
  it("places a candidate in the targeted slot and rejects duplicate or occupied drops", () => {
    const empty = Array<string | null>(9).fill(null);
    const firstDrop = assignCandidateToSlot(empty, "candidate-1", 4);
    expect(firstDrop.error).toBeNull();
    expect(firstDrop.slots[4]).toBe("candidate-1");
    expect(assignCandidateToSlot(firstDrop.slots, "candidate-1", 5).error).toBe("DUPLICATE_CANDIDATE");
    expect(assignCandidateToSlot(firstDrop.slots, "candidate-2", 4).error).toBe("SLOT_OCCUPIED");
  });
});

describe("result aggregation", () => {
  it("counts selections and uses Vietnamese name order to break ties", () => {
    const candidates = [
      { id: "b", name: "Bình", image_url: "b.png" },
      { id: "a", name: "An", image_url: "a.png" },
      { id: "c", name: "Chi", image_url: "c.png" },
    ];
    expect(aggregateResults(candidates, ["b", "a", "a", "c"])).toEqual([
      { ...candidates[1], total: 2 }, { ...candidates[0], total: 1 }, { ...candidates[2], total: 1 },
    ]);
  });
  it("refreshes after vote notifications, reconnect, and window focus", () => {
    expect(shouldRefreshResults("vote-recorded")).toBe(true);
    expect(shouldRefreshResults("subscribed")).toBe(true);
    expect(shouldRefreshResults("focus")).toBe(true);
  });
});
