import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { parseRoster } from "@/lib/roster-parser";
import { removeDraftAt, undoDraftRemoval } from "@/lib/roster-state";
import type { CandidateDraft } from "@/lib/types";

async function workbookBuffer(rows: unknown[][]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Ung vien");
  rows.forEach((row) => sheet.addRow(row));
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe("Excel roster import", () => {
  it("reads required headers and image URLs", async () => {
    const buffer = await workbookBuffer([["Họ tên tiếng Việt", "Hình ảnh", "Họ tên tiếng Hoa"], ["Nguyễn An", "https://example.org/an.png", "王小明"]]);
    await expect(parseRoster(buffer)).resolves.toEqual([{ name_zh: "王小明", name_vi: "Nguyễn An", image: "https://example.org/an.png" }]);
  });
  it("reads an embedded portrait anchored in the image column", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ung vien");
    sheet.addRow(["Họ tên tiếng Hoa", "Họ tên tiếng Việt", "Hình ảnh"]);
    sheet.addRow(["王小明", "Nguyễn An", ""]);
    const imageId = workbook.addImage({ base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR5kAAAAASUVORK5CYII=", extension: "png" });
    sheet.addImage(imageId, "C2:D4");
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    await expect(parseRoster(buffer)).resolves.toMatchObject([{ name_zh: "王小明", name_vi: "Nguyễn An", image: expect.stringMatching(/^data:image\/png;base64,/) }]);
  });
  it("reports missing required columns and incomplete candidate rows", async () => {
    await expect(parseRoster(await workbookBuffer([["Tên", "Ảnh"], ["Nguyễn An", "https://example.org/an.png"]]))).rejects.toMatchObject({ code: "ROSTER_COLUMNS_MISSING" });
    await expect(parseRoster(await workbookBuffer([["Họ tên tiếng Hoa", "Họ tên tiếng Việt", "Hình ảnh"], ["王小明", "Nguyễn An", ""]]))).rejects.toMatchObject({
      code: "ROSTER_ROW_ERRORS",
      values: { problems: [{ code: "ROSTER_ROW_REQUIRED", values: { field: "image" } }] },
    });
    await expect(parseRoster(await workbookBuffer([["Họ tên tiếng Hoa", "Họ tên tiếng Việt", "Hình ảnh"], ["王小明", "", "https://example.org/an.png"]]))).rejects.toMatchObject({
      code: "ROSTER_ROW_ERRORS", values: { problems: [{ values: { field: "name_vi" } }] },
    });
  });
  it("reads Traditional Chinese roster headings", async () => {
    const buffer = await workbookBuffer([["中文姓名", "越南文姓名", "照片"], ["王小明", "Nguyễn An", "https://example.org/wang.png"]]);
    await expect(parseRoster(buffer)).resolves.toEqual([{ name_zh: "王小明", name_vi: "Nguyễn An", image: "https://example.org/wang.png" }]);
  });
});

describe("provisional candidate undo", () => {
  it("restores the last deleted candidate at its original position", () => {
    const rows: CandidateDraft[] = ["An", "Bình", "Chi"].map((name_vi) => ({ name_zh: `中${name_vi}`, name_vi, image: `${name_vi}.png` }));
    const removed = removeDraftAt(rows, 1);
    expect(removed.rows.map((row) => row.name_vi)).toEqual(["An", "Chi"]);
    expect(undoDraftRemoval(removed.rows, removed.deleted).map((row) => row.name_vi)).toEqual(["An", "Bình", "Chi"]);
  });
});
