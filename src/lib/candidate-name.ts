import type { Locale } from "@/lib/i18n";

export function candidateName(candidate: { name_zh: string; name_vi: string }, locale: Locale): string {
  return locale === "zh-TW" ? candidate.name_zh : candidate.name_vi;
}
