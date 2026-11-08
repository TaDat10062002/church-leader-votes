// Source: kostyniuk/glasscn-components, see docs/liquid-glass.md.
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

export type FrostGlassVariant = "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract";
export type FrostGlassVariantProp = { glassVariant?: FrostGlassVariant };

export const liquidRefractStyles = "bg-transparent border-0 shadow-none";

export const glassVariantStyles: Record<FrostGlassVariant, string> = {
  clear: [
    "backdrop-blur-[2px] backdrop-saturate-[1.9]",
    "bg-white/[0.25] dark:bg-black/[0.25]",
    "border border-white/[0.5] dark:border-white/[0.12]",
    "shadow-[0_1px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.2)]",
  ].join(" "),
  frosted: [
    "backdrop-blur-[2px] backdrop-saturate-[1.6]",
    "bg-white/[0.55] dark:bg-black/[0.35]",
    "border border-white/[0.4] dark:border-white/10",
    "shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]",
  ].join(" "),
  subtle: [
    "backdrop-blur-[2px] backdrop-saturate-[1.5]",
    "bg-white/[0.3] dark:bg-white/[0.06]",
    "border border-black/[0.05] dark:border-white/[0.08]",
    "shadow-sm",
  ].join(" "),
  liquid: [
    // Keep the fill close to clear glass; the backdrop carries most of the color.
    "backdrop-blur-[2px] backdrop-saturate-[1.45] backdrop-brightness-[1.02]",
    "dark:backdrop-saturate-[1.25] dark:backdrop-brightness-[0.98]",

    // 2) Base translucent fill (acts as the panel's "tint").
    "bg-white/[0.025] dark:bg-white/[0.012]",

    // 3) Layered radial-gradient sheen + warm bottom tint + vertical wash.
    //    Underscores represent spaces inside Tailwind arbitrary values.
    "[background-image:radial-gradient(120%_85%_at_15%_8%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.06)_38%,rgba(255,255,255,0)_70%),radial-gradient(110%_80%_at_85%_100%,rgba(255,210,230,0.035)_0%,rgba(255,255,255,0)_60%),linear-gradient(180deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.025)_100%)]",
    "dark:[background-image:radial-gradient(120%_85%_at_15%_8%,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.02)_40%,rgba(255,255,255,0)_70%),radial-gradient(110%_80%_at_85%_100%,rgba(120,170,255,0.035)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,rgba(255,255,255,0.025)_0%,rgba(0,0,0,0.055)_100%)]",
    "[background-size:200%_200%,180%_180%,100%_100%]",
    "[background-repeat:no-repeat]",

    // 4) Multi-layer bevel:
    //    - inset top hairline highlight (light-from-above)
    //    - inset fish-eye glow at the bottom (lensing artifact)
    //    - thin inset side rails
    //    - outer contact shadow + broader halo (panel feels floating)
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-12px_24px_-10px_rgba(255,255,255,0.12),inset_1px_0_0_0_rgba(255,255,255,0.1),inset_-1px_0_0_0_rgba(255,255,255,0.08),0_24px_60px_-18px_rgba(15,23,42,0.18),0_8px_24px_-8px_rgba(15,23,42,0.12)]",
    "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_-14px_28px_-10px_rgba(180,210,255,0.07),inset_1px_0_0_0_rgba(255,255,255,0.06),inset_-1px_0_0_0_rgba(255,255,255,0.04),0_28px_70px_-18px_rgba(0,0,0,0.38),0_10px_28px_-10px_rgba(0,0,0,0.28)]",

    // 5) Hairline border for the chamfer's outer edge.
    "border border-white/[0.24] dark:border-white/[0.07]",

    // 6) Slow ambient drift; respects prefers-reduced-motion.
    "animate-[liquid-drift_18s_ease-in-out_infinite] motion-reduce:animate-none",
    "[will-change:background-position]",
  ].join(" "),
  "liquid-refract": "",
};

/** Apply the registry material to an existing semantic host without adding DOM. */
export function glassClassName(variant: FrostGlassVariant = "subtle", ...classes: ClassValue[]) {
  return cn("glasscn-material", `glasscn-variant-${variant}`, glassVariantStyles[variant], ...classes);
}
