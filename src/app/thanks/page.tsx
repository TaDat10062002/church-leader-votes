"use client";

import { Check, Church } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GlassChip } from "@/components/ui/glass-chip";
import { ThemeControl } from "@/components/theme/theme-control";
import { useLocale } from "@/components/locale/locale-provider";

export default function ThanksPage() {
  const { t } = useLocale();
  return (
    <main className="relative grid min-h-dvh place-items-center px-5 py-10">
      <ThemeControl className="theme-control--floating" />
      <Card
        role="status"
        aria-live="polite"
        className="thanks-card w-full max-w-sm p-8 text-center sm:p-10"
      >
        <GlassChip className="mx-auto grid h-11 w-11 place-items-center rounded-full text-moss">
          <Church size={21} aria-hidden="true" />
        </GlassChip>
        <GlassChip
          glassVariant="clear"
          className="mx-auto mt-7 grid h-16 w-16 place-items-center rounded-full text-moss"
        >
          <Check size={30} aria-hidden="true" />
        </GlassChip>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-moss">
          {t("thankYouEyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {t("thanksHeading")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/75">
          {t("thanksDescription")}
        </p>
      </Card>
    </main>
  );
}
