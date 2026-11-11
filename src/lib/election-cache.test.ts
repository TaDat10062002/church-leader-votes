import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  revalidateTag: vi.fn(),
  unstableCache: vi.fn((fn: () => Promise<unknown>) => fn),
  requireAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({ unstable_cache: mocks.unstableCache, revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/supabase", () => ({ getSupabaseAdmin: () => ({ from: mocks.from }) }));
vi.mock("@/lib/http", () => ({
  requireAdmin: mocks.requireAdmin,
  apiError: (code: string, status: number) => Response.json({ code }, { status }),
}));

import { ACTIVE_ELECTION_TAG, ELECTION_RESULTS_TAG, getCachedActiveElection, invalidateElectionCache } from "@/lib/election-cache";
import { GET as getResults } from "@/app/api/admin/results/route";

describe("election data cache", () => {
  beforeEach(() => {
    mocks.from.mockReset();
    mocks.revalidateTag.mockReset();
    mocks.requireAdmin.mockReset();
  });

  it("uses distinct tags and bounded revalidation for each shared snapshot", () => {
    expect(mocks.unstableCache).toHaveBeenCalledWith(expect.any(Function), ["active-election-v1"], { revalidate: 3600, tags: [ACTIVE_ELECTION_TAG] });
    expect(mocks.unstableCache).toHaveBeenCalledWith(expect.any(Function), ["election-results-v1"], { revalidate: 3600, tags: [ELECTION_RESULTS_TAG] });
  });

  it("does not cache database errors as a successful empty election", async () => {
    const builder = { select: vi.fn(), order: vi.fn(), limit: vi.fn(), maybeSingle: vi.fn() };
    builder.select.mockReturnValue(builder);
    builder.order.mockReturnValue(builder);
    builder.limit.mockReturnValue(builder);
    builder.maybeSingle.mockResolvedValue({ data: null, error: new Error("database unavailable") });
    mocks.from.mockReturnValue(builder);
    await expect(getCachedActiveElection()).rejects.toThrow("database unavailable");
  });

  it("checks the administrator session before looking up cached results", async () => {
    mocks.requireAdmin.mockResolvedValue(new Response(null, { status: 401 }));
    const response = await getResults(new Request("http://localhost/api/admin/results"));
    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("continues invalidating other tags if one invalidation fails", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.revalidateTag.mockImplementationOnce(() => { throw new Error("cache unavailable"); });
    invalidateElectionCache(ACTIVE_ELECTION_TAG, ELECTION_RESULTS_TAG);
    expect(mocks.revalidateTag).toHaveBeenCalledWith(ACTIVE_ELECTION_TAG);
    expect(mocks.revalidateTag).toHaveBeenCalledWith(ELECTION_RESULTS_TAG);
    log.mockRestore();
  });
});
