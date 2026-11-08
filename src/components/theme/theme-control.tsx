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
    <div className={glassClassName("subtle", "locale-switch")} role="group" aria-label={t("language")}>
      <motion.span
        aria-hidden="true"
        className="locale-switch-thumb"
        initial={false}
        animate={{ x: locale === "zh-TW" ? 44 : 0 }}
        transition={reduceMotion ? { duration: 0 } : {
          type: "spring",
          stiffness: 520,
          damping: 34,
          mass: 0.55,
        }}
      >
        {!reduceMotion && (
          <AnimatePresence initial={false}>
            <motion.span
              key={locale}
              className="locale-switch-glint"
              initial={{ x: "-140%", opacity: 0 }}
              animate={{ x: "320%", opacity: [0, 0.65, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
            />
          </AnimatePresence>
        )}
      </motion.span>
      <button type="button" aria-label={t("languageVi")} aria-pressed={locale === "vi"} onClick={() => setLocale("vi")} className="locale-switch-option">VI</button>
      <button type="button" aria-label={t("languageZhTw")} aria-pressed={locale === "zh-TW"} onClick={() => setLocale("zh-TW")} className="locale-switch-option">繁中</button>
    </div>
  </div>;
}
