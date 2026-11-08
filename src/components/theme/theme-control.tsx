"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAppearanceTheme } from "@/components/theme/theme-provider";
import { glassClassName } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

export function ThemeControl({ className }: { className?: string }) {
  const { resolvedTheme, palette, setPalette, toggleTheme } = useAppearanceTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Moon : Sun;

  return <div className={cn("appearance-controls", className)}>
    <div className={glassClassName("subtle", "palette-control")} role="group" aria-label="Chọn nền giao diện">
      <button type="button" aria-label="Nền Jade xanh lá champagne" title="Nền Jade" aria-pressed={palette === "green"} className="palette-option" onClick={() => setPalette("green")}>
        <span aria-hidden="true" className="palette-swatch" style={{ background: "linear-gradient(135deg, #347a54, #91b780 52%, #d3ad68)" }} />
      </button>
      <button type="button" aria-label="Nền Aurora tím xanh cyan" title="Nền Aurora" aria-pressed={palette === "navy"} className="palette-option" onClick={() => setPalette("navy")}>
        <span aria-hidden="true" className="palette-swatch" style={{ background: "linear-gradient(135deg, #6366f1, #38bdf8 60%, #22d3ee)" }} />
      </button>
    </div>
    <motion.button
      type="button"
      role="switch"
      aria-label="Giao diện tối"
      aria-checked={isDark}
      title={`Giao diện ${isDark ? "tối" : "sáng"}. Bấm để chuyển.`}
      className={glassClassName("clear", "icon-switch-control")}
      initial={false}
      onClick={(event) => toggleTheme(event.currentTarget)}
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
        animate={{ x: isDark ? 16 : 0 }}
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
            <Icon size={12} />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  </div>;
}
