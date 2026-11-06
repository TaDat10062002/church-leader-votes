import { NextResponse } from "next/server";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

export async function requireAdmin(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`))?.slice(adminCookieName.length + 1);
  if (await isAdminToken(token)) return null;
  return NextResponse.json({ error: "Phiên quản trị không hợp lệ." }, { status: 401 });
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
}
