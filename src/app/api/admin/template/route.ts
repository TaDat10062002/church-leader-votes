import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Church Leadership Voting";
  workbook.subject = "Candidate roster import template";

  const roster = workbook.addWorksheet("Danh sách ứng viên");
  roster.columns = [
    { header: "Họ tên", key: "name", width: 34 },
    { header: "Hình ảnh", key: "image", width: 56 },
  ];
  roster.views = [{ state: "frozen", ySplit: 1 }];
  roster.getRow(1).height = 26;
  roster.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  roster.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF426B53" } };
  roster.getRow(1).alignment = { vertical: "middle" };
  roster.autoFilter = "A1:B1";

  const guide = workbook.addWorksheet("Hướng dẫn");
  guide.columns = [{ width: 28 }, { width: 100 }];
  guide.addRows([
    ["Cách dùng", "Hướng dẫn"],
    ["Cột bắt buộc", "Giữ nguyên tên hai cột ở hàng đầu: Họ tên và Hình ảnh."],
    ["Mỗi ứng viên", "Nhập họ tên ở cột Họ tên; điền URL ảnh http(s) ở cột Hình ảnh hoặc chèn ảnh vào đúng ô Hình ảnh."],
    ["Định dạng ảnh", "Ảnh nhúng hỗ trợ JPG, PNG hoặc WEBP. Ảnh URL phải truy cập được từ trình duyệt."],
    ["Lưu file", "Lưu workbook dưới dạng .xlsx rồi tải lên trang import. Sheet đầu tiên là sheet danh sách ứng viên."],
  ]);
  guide.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  guide.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF426B53" } };
  guide.getColumn(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="mau-danh-sach-ung-vien.xlsx"',
      "Cache-Control": "private, no-store",
    },
  });
}
