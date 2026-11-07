"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "primary", ...props }, ref) {
  const variants = {
    primary: "glass-button-primary text-ink",
    secondary: "glass-button-secondary text-ink",
    ghost: "glass-button-ghost text-ink/80",
    danger: "glass-button-danger",
  };
  return <GlassButton ref={ref} tint={0.04} className={cn(variants[variant], className)} {...props} />;
});
