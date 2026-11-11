import type { HTMLAttributes } from "react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ThemeControl } from "@/components/theme/theme-control";
import { cn } from "@/lib/utils";

export function GlassHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "glasscn-header sticky top-2 z-40 w-full min-w-0",
        className,
      )}
      {...props}
    >
      <GlassSurface
        glassVariant="liquid-refract"
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-4 py-3 sm:px-5"
      >
        {children}
        <ThemeControl />
      </GlassSurface>
    </header>
  );
}
