import type { HTMLAttributes } from "react";
import { ThemeControl } from "@/components/theme/theme-control";
import { cn } from "@/lib/utils";

export function AppHeader({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header className={cn("app-header", className)} {...props}>
      {children}
      <ThemeControl />
    </header>
  );
}
