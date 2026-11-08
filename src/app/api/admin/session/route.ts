import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, checkPasscode, createAdminToken } from "@/lib/admin-auth";
import { apiError } from "@/lib/http";

export async function POST(request: Request) {
  let body: { passcode?: string };
  try { body = await request.json(); } catch { return apiError("REQUEST_INVALID", 400); }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!body.passcode || !checkPasscode(body.passcode, ip)) return apiError("ADMIN_LOGIN_REJECTED", 401);
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName, await createAdminToken(), adminCookieOptions);
    return response;
  } catch (error) {
    console.error("Admin session creation failed", error);
    return apiError("ADMIN_SESSION_CREATE_FAILED", 500);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
