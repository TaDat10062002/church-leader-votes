import ExcelJS from "exceljs";
import type { CandidateDraft } from "@/lib/types";

export async function parseRoster(buffer: Buffer): Promise<CandidateDraft[]> {
  const workbook = new ExcelJS.Workbook();
  const compatibleBuffer = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(compatibleBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("File Excel không có sheet dữ liệu.");
  const header = (value: ExcelJS.CellValue) => String(value ?? "").trim().toLocaleLowerCase("vi");
  let nameCol = 0; let imageCol = 0;
  sheet.getRow(1).eachCell((cell, col) => {
    const value = header(cell.value);
    if (value === "họ tên") nameCol = col;
    if (value === "hình ảnh") imageCol = col;
  });
  if (!nameCol || !imageCol) throw new Error("File cần có hai cột bắt buộc: Họ tên và Hình ảnh.");

  const imageByRow = new Map<number, string>();
  const workbookWithMedia = workbook as unknown as { getImage(id: number | string): { buffer: Buffer; extension: string } };
  const problems: string[] = [];
  for (const item of sheet.getImages()) {
    const row = item.range.tl.nativeRow + 1;
    const col = item.range.tl.nativeCol + 1;
    if (col !== imageCol) continue;
    const media = workbookWithMedia.getImage(item.imageId);
    if (!media?.buffer) continue;
    const extension = media.extension.toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(extension)) { problems.push(`Dòng ${row}: chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.`); continue; }
    const mime = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : extension === "webp" ? "image/webp" : "image/png";
    imageByRow.set(row, `data:${mime};base64,${media.buffer.toString("base64")}`);
  }

  const candidates: CandidateDraft[] = [];
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    const name = String(row.getCell(nameCol).text || row.getCell(nameCol).value || "").trim();
    const rawImage = row.getCell(imageCol).value;
    let image = imageByRow.get(rowIndex) ?? "";
    if (!image && rawImage && typeof rawImage === "object" && "hyperlink" in rawImage) image = String((rawImage as { hyperlink: string }).hyperlink);
    if (!image && typeof rawImage === "string") image = rawImage.trim();
    if (!name && !image) continue;
    if (!name || !image) { problems.push(`Dòng ${rowIndex}: thiếu ${!name ? "họ tên" : "hình ảnh"}.`); continue; }
    if (!image.startsWith("data:image/") && !/^https?:\/\//i.test(image)) { problems.push(`Dòng ${rowIndex}: hình ảnh cần là ảnh nhúng hoặc URL http(s).`); continue; }
    candidates.push({ name, image });
  }
  if (problems.length) throw new Error(problems.slice(0, 8).join(" "));
  if (!candidates.length) throw new Error("Không tìm thấy ứng viên trong file.");
  return candidates;
}
