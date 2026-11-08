"use client";

import { forwardRef } from "react";
import { GlassCard, type GlassCardProps } from "@/components/ui/glasscn/glass-card";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, GlassCardProps>(function Card({ className, ...props }, ref) {
  return <GlassCard ref={ref} className={cn("rounded-3xl", className)} {...props} />;
});
