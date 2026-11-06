import { describe, expect, it } from "vitest";
import { getElectionViewStatus } from "@/lib/election-view";

describe("voter election view state", () => {
  it("switches between opened, closed, and unavailable states", () => {
    expect(getElectionViewStatus({ id: "election-1", status: "opened", candidates: [] })).toBe("opened");
    expect(getElectionViewStatus({ id: "election-1", status: "closed" })).toBe("closed");
    expect(getElectionViewStatus(null)).toBe("unavailable");
    expect(getElectionViewStatus({ id: "election-2", status: "opened", candidates: [] })).toBe("opened");
  });
});
