import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({ from: mocks.from }),
}));

import { GET } from "@/app/api/elections/active/route";

function query(result: unknown) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "order", "limit"]) builder[method] = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => result);
  builder.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return builder;
}

describe("active election route", () => {
  beforeEach(() => mocks.from.mockReset());

  it("returns the latest opened election and its candidates", async () => {
    const electionQuery = query({ data: { id: "election-1", status: "opened" }, error: null });
    const candidatesQuery = query({ data: [{ id: "candidate-1", name_zh: "王", name_vi: "A", image_url: "a.png" }], error: null });
    mocks.from.mockImplementation((table: string) => table === "elections" ? electionQuery : candidatesQuery);

    const response = await GET();
    expect(await response.json()).toEqual({ election: {
      id: "election-1", status: "opened", candidates: [{ id: "candidate-1", name_zh: "王", name_vi: "A", image_url: "a.png" }],
    } });
    expect(electionQuery.order).toHaveBeenCalledWith("started_at", { ascending: false });
    expect(electionQuery.limit).toHaveBeenCalledWith(1);
    expect(mocks.from).toHaveBeenCalledTimes(2);
  });

  it("returns a closed election without loading candidates", async () => {
    mocks.from.mockReturnValue(query({ data: { id: "election-1", status: "closed" }, error: null }));

    const response = await GET();
    expect(await response.json()).toEqual({ election: { id: "election-1", status: "closed" } });
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it("returns an explicit no-election state", async () => {
    mocks.from.mockReturnValue(query({ data: null, error: null }));

    const response = await GET();
    expect(await response.json()).toEqual({ election: null });
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });
});
