import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), httpSend: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({
    rpc: mocks.rpc,
    channel: () => ({ httpSend: mocks.httpSend }),
  }),
}));

import { POST } from "@/app/api/votes/route";

describe("vote route", () => {
  beforeEach(() => {
    mocks.rpc.mockReset().mockResolvedValue({ data: "vote-1", error: null });
    mocks.httpSend.mockReset().mockResolvedValue({ success: true });
  });

  it("publishes an election-only notification after the ballot RPC commits", async () => {
    const response = await POST(new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ electionId: "election-1", candidateIds: ["candidate-1"] }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("cast_vote", { p_election_id: "election-1", p_candidate_ids: ["candidate-1"] });
    expect(mocks.httpSend).toHaveBeenCalledWith("vote-recorded", { electionId: "election-1" }, { timeout: 2500 });
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.httpSend.mock.invocationCallOrder[0]);
  });

  it("rejects invalid ballots without writing or publishing", async () => {
    const response = await POST(new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ electionId: "election-1", candidateIds: ["candidate-1", "candidate-1"] }),
    }));

    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.httpSend).not.toHaveBeenCalled();
  });

  it("reports a closed-election rejection without publishing a vote notification", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "ELECTION_NOT_OPEN" } });
    const response = await POST(new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ electionId: "election-1", candidateIds: ["candidate-1"] }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Kỳ bầu chọn hiện không mở." });
    expect(mocks.httpSend).not.toHaveBeenCalled();
  });

  it("keeps the committed ballot successful if notification delivery fails", async () => {
    mocks.httpSend.mockRejectedValue(new Error("Realtime unavailable"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ electionId: "election-1", candidateIds: ["candidate-1"] }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledOnce();
    error.mockRestore();
  });
});
