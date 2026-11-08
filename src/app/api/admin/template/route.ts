import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/http";
import { resolveLocaleCookie, translate } from "@/lib/i18n";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const locale = resolveLocaleCookie(request.headers.get("cookie"));
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = t("metadataTitle");
  workbook.subject = t("appDescription");

  const roster = workbook.addWorksheet(t("copiedTemplateTitle"));
  roster.columns = [
    { header: locale === "vi" ? "Họ tên" : "姓名", key: "name", width: 34 },
    { header: locale === "vi" ? "Hình ảnh" : "照片", key: "image", width: 56 },
  ];
  roster.views = [{ state: "frozen", ySplit: 1 }];
  roster.getRow(1).height = 26;
  roster.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  roster.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF426B53" } };
  roster.getRow(1).alignment = { vertical: "middle" };
  roster.autoFilter = "A1:B1";

  const guide = workbook.addWorksheet(t("templateGuideTitle"));
  guide.columns = [{ width: 28 }, { width: 100 }];
  guide.addRows([
    [t("templateHowTo"), t("templateInstructions")],
    [t("templateRequired"), t("templateRequiredDescription")],
    [t("templateEachCandidate"), t("templateEachCandidateDescription")],
    [t("templateImageFormat"), t("templateImageFormatDescription")],
    [t("templateSave"), t("templateSaveDescription")],
  ]);
  guide.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  guide.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF426B53" } };
  guide.getColumn(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(t("templateFilename"))}`,
      "Cache-Control": "private, no-store",
    },
  });
}
