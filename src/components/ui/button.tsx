"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { GlassButton } from "@/components/ui/glasscn/glass-button";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "primary", type = "button", ...props }, ref) {
  const primitiveVariant = variant === "primary" ? "default" : variant === "danger" ? "destructive" : variant;
  return <GlassButton ref={ref} type={type} glassVariant={variant === "ghost" ? "subtle" : "liquid"}
    variant={primitiveVariant} className={cn(
      "glasscn-button min-h-11 gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold whitespace-normal",
      `glasscn-button-${variant}`, className,
    )} {...props} />;
});
