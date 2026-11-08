import type { HTMLAttributes } from "react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ThemeControl } from "@/components/theme/theme-control";
import { cn } from "@/lib/utils";

export function GlassHeader({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn("glasscn-header sticky top-3 z-40 isolate rounded-full", className)} {...props}>
    <GlassSurface glassVariant="liquid-refract" className="flex w-full flex-wrap items-center justify-between gap-3 rounded-full px-4 py-3">
      {children}
      <ThemeControl />
    </GlassSurface>
  </header>;
}
