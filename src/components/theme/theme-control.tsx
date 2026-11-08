"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAppearanceTheme } from "@/components/theme/theme-provider";
import { glassClassName } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale/locale-provider";

export function ThemeControl({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useAppearanceTheme();
  const { locale, setLocale, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Moon : Sun;

  return <div className={cn("appearance-controls", className)}>
    <motion.button
      type="button"
      role="switch"
      aria-label={t("themeDark")}
      aria-checked={isDark}
      title={t("themeTitle", { mode: t(isDark ? "dark" : "light") })}
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
    <div className={glassClassName("subtle", "flex items-center gap-0.5 rounded-full p-0.5")} role="group" aria-label={t("language")}>
      <button type="button" aria-label={t("languageVi")} aria-pressed={locale === "vi"} onClick={() => setLocale("vi")} className="rounded-full px-2 py-1 text-[10px] font-semibold text-ink aria-pressed:bg-white/60 sm:text-xs">VI</button>
      <button type="button" aria-label={t("languageZhTw")} aria-pressed={locale === "zh-TW"} onClick={() => setLocale("zh-TW")} className="rounded-full px-2 py-1 text-[10px] font-semibold text-ink aria-pressed:bg-white/60 sm:text-xs">繁中</button>
    </div>
  </div>;
}
