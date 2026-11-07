"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAppearanceTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeControl({ className }: { className?: string }) {
  const { resolvedTheme, palette, setPalette, toggleTheme } = useAppearanceTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Moon : Sun;

  return <div className={cn("appearance-controls", className)}>
    <div className="palette-control glass-chip" role="group" aria-label="Màu nhấn">
      <button type="button" aria-label="Màu xanh lá" title="Màu xanh lá" aria-pressed={palette === "green"} onClick={() => setPalette("green")}>
        <span aria-hidden="true" className="palette-swatch" style={{ backgroundColor: "#426b53" }} />
      </button>
      <button type="button" aria-label="Màu xanh navy dịu" title="Màu xanh navy dịu" aria-pressed={palette === "navy"} onClick={() => setPalette("navy")}>
        <span aria-hidden="true" className="palette-swatch" style={{ backgroundColor: "#526d8a" }} />
      </button>
    </div>
    <motion.button
      type="button"
      role="switch"
      aria-label="Giao diện tối"
      aria-checked={isDark}
      title={`Giao diện ${isDark ? "tối" : "sáng"}. Bấm để chuyển.`}
      className="icon-switch-control glass-chip"
      initial={false}
      onClick={(event) => toggleTheme(event.currentTarget)}
      animate={{ backgroundColor: isDark ? (palette === "navy" ? "rgba(75, 103, 137, 0.42)" : "rgba(104, 153, 119, 0.42)") : (palette === "navy" ? "rgba(82, 109, 138, 0.08)" : "rgba(24, 51, 45, 0.08)") }}
      transition={reduceMotion ? { duration: 0 } : { backgroundColor: { duration: 0.24, ease: "easeInOut" } }}
    >
      <span aria-hidden="true" className="icon-switch-mode-icon icon-switch-mode-icon--left">
        <Sun size={14} />
      </span>
      <span aria-hidden="true" className="icon-switch-mode-icon icon-switch-mode-icon--right">
        <Moon size={14} />
      </span>
      <motion.span
        aria-hidden="true"
        className="icon-switch-thumb"
        initial={false}
        animate={{ x: isDark ? 22.88 : 0 }}
        whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        transition={reduceMotion ? { duration: 0 } : {
          x: { type: "spring", stiffness: 500, damping: 32, mass: 0.5 },
          scale: { type: "spring", stiffness: 620, damping: 24, mass: 0.45 },
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isDark ? "moon" : "sun"}
            className="grid place-items-center"
            initial={reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <Icon size={14} />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  </div>;
}
