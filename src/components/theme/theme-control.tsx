"use client";

import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useAppearanceTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeControl({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useAppearanceTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Moon : Sun;

  return <motion.button
    type="button"
    role="switch"
    aria-label="Giao diện tối"
    aria-checked={isDark}
    title={`Giao diện ${isDark ? "tối" : "sáng"}. Bấm để chuyển.`}
    className={cn("theme-control glass-chip", className)}
    initial={false}
    onClick={(event) => toggleTheme(event.currentTarget)}
    animate={{ backgroundColor: isDark ? "rgba(104, 153, 119, 0.52)" : "rgba(24, 51, 45, 0.08)" }}
    transition={reduceMotion ? { duration: 0 } : { backgroundColor: { duration: 0.24, ease: "easeInOut" } }}
  >
    <motion.span
      aria-hidden="true"
      className="theme-toggle-thumb"
      initial={false}
      animate={{ x: isDark ? 22.88 : 0 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      transition={reduceMotion ? { duration: 0 } : {
        x: { type: "spring", stiffness: 500, damping: 32, mass: 0.5 },
        scale: { type: "spring", stiffness: 620, damping: 24, mass: 0.45 },
      }}
    >
      <Icon size={14} />
    </motion.span>
  </motion.button>;
}
