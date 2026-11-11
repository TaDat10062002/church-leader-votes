"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";

// Keep the language selector available wherever the appearance controls were used.
export function ThemeControl({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className={cn("locale-switch", className)} role="group" aria-label={t("language")}>
      <button type="button" aria-label={t("languageVi")} aria-pressed={locale === "vi"} onClick={() => setLocale("vi")} className="locale-switch-option">VI</button>
      <button type="button" aria-label={t("languageZhTw")} aria-pressed={locale === "zh-TW"} onClick={() => setLocale("zh-TW")} className="locale-switch-option">繁中</button>
    </div>
  );
}
