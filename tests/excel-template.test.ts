import ExcelJS from "exceljs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/http", () => ({ requireAdmin: vi.fn().mockResolvedValue(null) }));

import { GET } from "@/app/api/admin/template/route";
import { parseRoster } from "@/lib/roster-parser";

describe("Excel template download", () => {
  it("downloads an xlsx with the required three-column roster sheet and instructions", async () => {
    const response = await GET(new Request("http://localhost/api/admin/template"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("spreadsheetml.sheet");
    expect(response.headers.get("content-disposition")).toContain("mau-danh-sach-ung-vien.xlsx");

    const workbook = new ExcelJS.Workbook();
    const bytes = Buffer.from(await response.arrayBuffer());
    await workbook.xlsx.load(bytes as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const roster = workbook.worksheets[0];
    expect(roster.name).toBe("Danh sách ứng viên");
    expect(roster.getRow(1).values).toEqual([undefined, "Họ tên tiếng Hoa", "Họ tên tiếng Việt", "Hình ảnh"]);
    expect(roster.columnCount).toBe(3);
    expect(workbook.getWorksheet("Hướng dẫn")?.getRow(2).getCell(2).text).toContain("Họ tên tiếng Việt");
  });

  it("downloads a Traditional Chinese template that can be parsed by the roster importer", async () => {
    const response = await GET(new Request("http://localhost/api/admin/template", { headers: { cookie: "app-locale=zh-TW" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain(encodeURIComponent("候選人名單範本.xlsx"));

    const workbook = new ExcelJS.Workbook();
    const bytes = Buffer.from(await response.arrayBuffer());
    await workbook.xlsx.load(bytes as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    expect(workbook.worksheets[0].name).toBe("候選人名單");
    expect(workbook.worksheets[0].getRow(1).values).toEqual([undefined, "中文姓名", "越南文姓名", "照片"]);
    expect(workbook.getWorksheet("使用說明")?.getRow(2).getCell(2).text).toContain("越南文姓名");
    workbook.worksheets[0].addRow(["王小明", "Nguyễn An", "https://example.org/a.png"]);
    await expect(parseRoster(Buffer.from(await workbook.xlsx.writeBuffer()))).resolves.toEqual([
      { name_zh: "王小明", name_vi: "Nguyễn An", image: "https://example.org/a.png" },
    ]);
  });
});
