"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { GlassIcon } from "@/components/ui/glasscn/glass-icon";
import type { FrostGlassVariantProp } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

export const GlassIconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & FrostGlassVariantProp>(
  function GlassIconButton({ className, glassVariant = "clear", ...props }, ref) {
    return <GlassIcon {...props} ref={ref} glassVariant={glassVariant}
      className={cn("size-11 shrink-0 text-ink", className)} />;
  },
);
