import type { HTMLAttributes } from "react";
import { type FrostGlassVariantProp, glassClassName } from "@/lib/glass-variants";

/** Decorative or textual chip; never introduces an interactive element. */
export function GlassChip({ className, glassVariant = "subtle", ...props }:
  HTMLAttributes<HTMLSpanElement> & FrostGlassVariantProp) {
  return <span {...props} data-slot="glass-chip" data-glass-variant={glassVariant}
    className={glassClassName(glassVariant, className)} />;
}
