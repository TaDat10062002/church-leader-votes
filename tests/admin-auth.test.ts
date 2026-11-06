import { beforeEach, describe, expect, it } from "vitest";
import { checkPasscode, createAdminToken, isAdminToken } from "@/lib/admin-auth";
import { POST as login } from "@/app/api/admin/session/route";

beforeEach(() => {
  process.env.ADMIN_ROLE = "ADMIN";
  process.env.ADMIN_PASSCODE = "1234";
  process.env.ADMIN_SESSION_SECRET = "a-test-only-signing-secret-long-enough-to-pass-validation";
});

describe("administrator access", () => {
  it("accepts only the configured passcode and ADMIN role", () => {
    expect(checkPasscode("1234", "test-correct")).toBe(true);
    expect(checkPasscode("0000", "test-wrong")).toBe(false);
    process.env.ADMIN_ROLE = "VOTER";
    expect(checkPasscode("1234", "test-role")).toBe(false);
  });

  it("signs and verifies an administrator session token", async () => {
    const token = await createAdminToken();
    expect(await isAdminToken(token)).toBe(true);
    expect(await isAdminToken(`${token}broken`)).toBe(false);
    process.env.ADMIN_ROLE = "VOTER";
    expect(await isAdminToken(token)).toBe(false);
  });

  it("sets an HttpOnly admin cookie only after the passcode is accepted", async () => {
    const ok = await login(new Request("http://localhost/api/admin/session", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "route-success" }, body: JSON.stringify({ passcode: "1234" }) }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("set-cookie")).toContain("HttpOnly");
    const denied = await login(new Request("http://localhost/api/admin/session", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "route-denied" }, body: JSON.stringify({ passcode: "bad" }) }));
    expect(denied.status).toBe(401);
    expect(denied.headers.get("set-cookie")).toBeNull();
  });
});
