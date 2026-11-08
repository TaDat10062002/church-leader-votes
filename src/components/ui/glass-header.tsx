import type { HTMLAttributes } from "react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ThemeControl } from "@/components/theme/theme-control";
import { cn } from "@/lib/utils";

export function GlassHeader({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn("glasscn-header sticky top-3 z-40 isolate w-full min-w-0 rounded-full", className)} {...props}>
    <GlassSurface glassVariant="liquid-refract" className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-2 rounded-full px-2 py-2 sm:flex-wrap sm:gap-3 sm:px-4 sm:py-3">
      {children}
      <ThemeControl />
    </GlassSurface>
  </header>;
}
