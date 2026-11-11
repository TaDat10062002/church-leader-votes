"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { type FrostGlassVariantProp, glassClassName } from "@/lib/glass-variants";
import { CardFooter } from "../card-base";
import type { LiquidGlassProps } from "./liquid-glass";

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & FrostGlassVariantProp & {
  liquidProps?: Pick<LiquidGlassProps, "blur" | "refraction" | "bezel" | "saturation">;
  contentClassName?: string;
};

// Registry adaptation: semantic/layout props and ref belong to the same outer
// host in every variant. Radix asChild depends on this contract.
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard({
  className, glassVariant = "liquid", liquidProps, contentClassName, children, ...props
}, ref) {
  void liquidProps;
  const content = contentClassName ? <div className={contentClassName}>{children}</div> : children;
  const rootClass = glassClassName(glassVariant, "rounded-2xl text-foreground", className);
  return <div {...props} ref={ref} data-slot="glass-card" data-glass-variant={glassVariant}
    className={rootClass}>{content}</div>;
});

export function GlassCardFooter({ className, glassVariant = "subtle", ...props }:
  React.ComponentProps<typeof CardFooter> & FrostGlassVariantProp) {
  return <CardFooter {...props} data-glass-variant={glassVariant}
    className={glassClassName(glassVariant, className)} />;
}
