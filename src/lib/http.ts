import { NextResponse } from "next/server";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

export async function requireAdmin(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`))?.slice(adminCookieName.length + 1);
  if (await isAdminToken(token)) return null;
  return NextResponse.json({ code: "ADMIN_UNAUTHORIZED" }, { status: 401 });
}

export function apiError(code: string, status: number, values?: Record<string, unknown>) {
  return NextResponse.json({ code, ...(values ? { values } : {}) }, { status });
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
}
