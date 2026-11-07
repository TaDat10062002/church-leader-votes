import type { HTMLAttributes } from "react";
import { GlassSurface } from "@/components/ui/glass";
import { ThemeControl } from "@/components/theme/theme-control";
import { cn } from "@/lib/utils";

export function GlassHeader({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn("glass-header relative isolate rounded-3xl border px-4 py-3 shadow-soft", className)} {...props}>
    <GlassSurface aria-hidden refract radius={24} tint={0.02} specular={false} className="pointer-events-none absolute inset-0 -z-10" />
    {children}
    <ThemeControl />
  </header>;
}
