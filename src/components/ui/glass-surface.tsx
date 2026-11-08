"use client";

import { forwardRef } from "react";
import {
  GlassCard,
  type GlassCardProps,
} from "@/components/ui/glasscn/glass-card";

export const GlassSurface = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassSurface(props, ref) {
    return <GlassCard ref={ref} {...props} />;
  },
);
