import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/http";
import { parseRoster, RosterParseError } from "@/lib/roster-parser";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return apiError("XLSX_REQUIRED", 400);
  if (!file.name.toLowerCase().endsWith(".xlsx") || file.size > MAX_FILE_SIZE) return apiError("XLSX_LIMIT", 400);

  try {
    const candidates = await parseRoster(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ candidates });
  } catch (error) {
    if (error instanceof RosterParseError) return apiError(error.code, 400, error.values);
    return apiError("WORKBOOK_INVALID", 400);
  }
}
