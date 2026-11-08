import { describe, expect, it } from "vitest";
import { apiErrorMessage, formatNumber, formatTime, messages, resolveLocale, resolveLocaleCookie, translate } from "@/lib/i18n";

describe("locale helpers", () => {
  it("accepts supported locales and falls back to Vietnamese", () => {
    expect(resolveLocale("vi")).toBe("vi");
    expect(resolveLocale("zh-TW")).toBe("zh-TW");
    expect(resolveLocale("zh-CN")).toBe("vi");
    expect(resolveLocale(undefined)).toBe("vi");
    expect(resolveLocaleCookie("other=x; app-locale=zh-TW")).toBe("zh-TW");
    expect(resolveLocaleCookie("app-locale=zh-CN")).toBe("vi");
    expect(resolveLocaleCookie("app-locale=%E0%A4%A")).toBe("vi");
  });

  it("keeps the Vietnamese and Traditional Chinese dictionaries aligned", () => {
    expect(Object.keys(messages["zh-TW"]).sort()).toEqual(Object.keys(messages.vi).sort());
  });

  it("interpolates translated messages", () => {
    expect(translate("zh-TW", "candidateCount", { count: 3 })).toContain("3");
    expect(apiErrorMessage("zh-TW", "IMAGE_TOO_LARGE", { name: "Ada" })).toContain("Ada");
  });

  it("formats numbers and times using the selected locale", () => {
    expect(formatNumber("vi", 1234)).not.toBe(formatNumber("zh-TW", 1234));
    expect(formatTime("vi", new Date("2026-01-02T03:04:05Z"))).toBeTruthy();
    expect(formatTime("zh-TW", new Date("2026-01-02T03:04:05Z"))).toBeTruthy();
  });
});
