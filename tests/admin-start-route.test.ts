import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), requireAdmin: vi.fn() }));
vi.mock("@/lib/http", () => ({
  requireAdmin: mocks.requireAdmin,
  apiError: (code: string, status: number) => Response.json({ code }, { status }),
}));
vi.mock("@/lib/supabase", () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }));

import { POST } from "@/app/api/admin/start/route";

describe("start election with bilingual names", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireAdmin.mockResolvedValue(null); });

  it("passes each language into its corresponding RPC field", async () => {
    mocks.rpc.mockResolvedValue({ data: "election-id", error: null });
    const response = await POST(new Request("http://localhost/api/admin/start", {
      method: "POST", body: JSON.stringify({ candidates: [{ name_zh: " 王小明 ", name_vi: " Nguyễn An ", image: "https://example.org/a.png" }] }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("start_election", { p_candidates: [{ name_zh: "王小明", name_vi: "Nguyễn An", image_url: "https://example.org/a.png", display_order: 1 }] });
  });

  it("rejects a candidate with a missing language", async () => {
    const response = await POST(new Request("http://localhost/api/admin/start", {
      method: "POST", body: JSON.stringify({ candidates: [{ name_zh: "王小明", image: "https://example.org/a.png" }] }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
