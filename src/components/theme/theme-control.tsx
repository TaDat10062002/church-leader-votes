"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { glassClassName } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale/locale-provider";

export function ThemeControl({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);

  return <div className={cn("appearance-controls", className)}>
    {mounted ? <AnimatedThemeToggler
      variant="circle"
      duration={reduceMotion ? 0 : 500}
      iconTransitionDuration={reduceMotion ? 0 : 180}
      role="switch"
      aria-label={t("themeDark")}
      aria-checked={isDark}
      title={t("themeTitle", { mode: t(isDark ? "dark" : "light") })}
      className={cn(glassClassName("clear", "icon-switch-control"), "[&_svg]:size-3")}
      theme={isDark ? "dark" : "light"}
      onThemeChange={setTheme}
    /> : <span className="theme-control-placeholder" aria-hidden="true" />}
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
