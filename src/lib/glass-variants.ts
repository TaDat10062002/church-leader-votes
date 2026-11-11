import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

// Existing callers keep their variant API while sharing an opaque surface style.
export type FrostGlassVariant = "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract";
export type FrostGlassVariantProp = { glassVariant?: FrostGlassVariant };
export const liquidRefractStyles = "border border-border bg-white";
export const glassVariantStyles: Record<FrostGlassVariant, string> = {
  clear: "border border-border bg-white",
  frosted: "border border-border bg-white",
  subtle: "border border-border bg-white",
  liquid: "border border-border bg-white",
  "liquid-refract": "border border-border bg-white",
};
export function glassClassName(variant: FrostGlassVariant = "subtle", ...classes: ClassValue[]) {
  return cn("glasscn-material", glassVariantStyles[variant], ...classes);
}
