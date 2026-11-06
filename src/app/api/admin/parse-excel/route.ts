import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/http";
import { parseRoster } from "@/lib/roster-parser";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Vui lòng chọn file Excel .xlsx." }, { status: 400 });
  if (!file.name.toLowerCase().endsWith(".xlsx") || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Chỉ hỗ trợ file .xlsx tối đa 10 MB." }, { status: 400 });

  try {
    const candidates = await parseRoster(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ candidates });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không đọc được workbook. Hãy kiểm tra file .xlsx và thử lại." }, { status: 400 });
  }
}
