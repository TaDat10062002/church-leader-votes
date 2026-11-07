"use client";

import { forwardRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import type { GlassSurfaceProps } from "@/components/ui/glass";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, GlassSurfaceProps>(function Card({ className, ...props }, ref) {
  return <GlassCard ref={ref} contentClassName="contents" className={cn("glass-card border shadow-soft", className)} {...props} />;
});
