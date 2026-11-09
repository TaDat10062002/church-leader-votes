import ExcelJS from "exceljs";
import type { CandidateDraft } from "@/lib/types";

export class RosterParseError extends Error {
  constructor(public readonly code: string, public readonly values?: Record<string, unknown>) {
    super(code);
    this.name = "RosterParseError";
  }
}

export async function parseRoster(buffer: Buffer): Promise<CandidateDraft[]> {
  const workbook = new ExcelJS.Workbook();
  const compatibleBuffer = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(compatibleBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new RosterParseError("WORKBOOK_SHEET_MISSING");
  const header = (value: ExcelJS.CellValue) => String(value ?? "").trim().toLocaleLowerCase("vi");
  let nameZhCol = 0; let nameViCol = 0; let imageCol = 0;
  sheet.getRow(1).eachCell((cell, col) => {
    const value = header(cell.value);
    if (["họ tên tiếng hoa", "中文姓名", "姓名"].includes(value)) nameZhCol = col;
    if (["họ tên tiếng việt", "越南文姓名"].includes(value)) nameViCol = col;
    if (value === "hình ảnh" || value === "照片") imageCol = col;
  });
  if (!nameZhCol || !nameViCol || !imageCol) throw new RosterParseError("ROSTER_COLUMNS_MISSING");

  const imageByRow = new Map<number, string>();
  const workbookWithMedia = workbook as unknown as { getImage(id: number | string): { buffer: Buffer; extension: string } };
  const problems: Array<{ code: string; values: Record<string, string | number> }> = [];
  for (const item of sheet.getImages()) {
    const row = item.range.tl.nativeRow + 1;
    const col = item.range.tl.nativeCol + 1;
    if (col !== imageCol) continue;
    const media = workbookWithMedia.getImage(item.imageId);
    if (!media?.buffer) continue;
    const extension = media.extension.toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(extension)) { problems.push({ code: "ROSTER_ROW_IMAGE_FORMAT", values: { row } }); continue; }
    const mime = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : extension === "webp" ? "image/webp" : "image/png";
    imageByRow.set(row, `data:${mime};base64,${media.buffer.toString("base64")}`);
  }

  const candidates: CandidateDraft[] = [];
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    const name_zh = String(row.getCell(nameZhCol).text || row.getCell(nameZhCol).value || "").trim();
    const name_vi = String(row.getCell(nameViCol).text || row.getCell(nameViCol).value || "").trim();
    const rawImage = row.getCell(imageCol).value;
    let image = imageByRow.get(rowIndex) ?? "";
    if (!image && rawImage && typeof rawImage === "object" && "hyperlink" in rawImage) image = String((rawImage as { hyperlink: string }).hyperlink);
    if (!image && typeof rawImage === "string") image = rawImage.trim();
    if (!name_zh && !name_vi && !image) continue;
    if (!name_zh || !name_vi || !image) { problems.push({ code: "ROSTER_ROW_REQUIRED", values: { row: rowIndex, field: !name_zh ? "name_zh" : !name_vi ? "name_vi" : "image" } }); continue; }
    if (!image.startsWith("data:image/") && !/^https?:\/\//i.test(image)) { problems.push({ code: "ROSTER_ROW_IMAGE_INVALID", values: { row: rowIndex } }); continue; }
    candidates.push({ name_zh, name_vi, image });
  }
  if (problems.length) throw new RosterParseError("ROSTER_ROW_ERRORS", { problems: problems.slice(0, 8) });
  if (!candidates.length) throw new RosterParseError("ROSTER_NO_CANDIDATES");
  return candidates;
}
