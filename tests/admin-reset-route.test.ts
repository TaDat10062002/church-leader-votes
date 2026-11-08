import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, rpc } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/http", () => ({
  requireAdmin,
  apiError: (code: string, status: number) => new Response(JSON.stringify({ code }), { status, headers: { "content-type": "application/json" } }),
}));
vi.mock("@/lib/supabase", () => ({ getSupabaseAdmin: () => ({ rpc }) }));

import { POST } from "@/app/api/admin/reset/route";

describe("POST /api/admin/reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests without an administrator session without calling the database", async () => {
    requireAdmin.mockResolvedValueOnce(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }));

    const response = await POST(new Request("http://localhost/api/admin/reset", { method: "POST" }));

    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reports success only after the reset RPC succeeds", async () => {
    requireAdmin.mockResolvedValueOnce(null);
    rpc.mockResolvedValueOnce({ error: null });

    const response = await POST(new Request("http://localhost/api/admin/reset", { method: "POST" }));

    expect(rpc).toHaveBeenCalledWith("reset_election");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("does not report success when the database reset fails", async () => {
    requireAdmin.mockResolvedValueOnce(null);
    rpc.mockResolvedValueOnce({ error: new Error("Database unavailable") });

    const response = await POST(new Request("http://localhost/api/admin/reset", { method: "POST" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ code: "ELECTION_RESET_FAILED" });
  });
});
