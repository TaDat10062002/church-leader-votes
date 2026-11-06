import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "primary", ...props }, ref) {
  const variants = {
    primary: "bg-ink text-white shadow-sm hover:bg-moss",
    secondary: "border border-ink/10 bg-white text-ink hover:border-moss/40 hover:bg-moss/5",
    ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  };
  return <button ref={ref} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} {...props} />;
});
