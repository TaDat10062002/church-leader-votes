import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, checkPasscode, createAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { passcode?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Thông tin không hợp lệ." }, { status: 400 }); }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!body.passcode || !checkPasscode(body.passcode, ip)) return NextResponse.json({ error: "Mã PIN không đúng hoặc đã thử quá nhiều lần." }, { status: 401 });
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName, await createAdminToken(), adminCookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo phiên quản trị." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
