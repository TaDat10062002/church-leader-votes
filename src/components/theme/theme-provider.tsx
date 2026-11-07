"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppearancePreference = "system" | "light" | "dark";

type Reveal = { x: number; y: number; radius: number; key: number };
type ThemeContextValue = {
  preference: AppearancePreference;
  resolvedTheme: "light" | "dark";
  setPreference: (preference: AppearancePreference, origin?: HTMLElement) => void;
  toggleTheme: (origin?: HTMLElement) => void;
};

const STORAGE_KEY = "appearance-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: AppearancePreference): "light" | "dark" {
  const resolved = preference === "system" ? systemTheme() : preference;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<AppearancePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [reveal, setReveal] = useState<Reveal | null>(null);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* System appearance is the default without storage access. */ }
    const initial = saved === "light" || saved === "dark" ? saved : "system";
    setPreferenceState(initial);
    setResolvedTheme(applyTheme(initial));
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => setResolvedTheme(applyTheme("system"));
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, [preference]);

  const setPreference = useCallback((next: AppearancePreference, origin?: HTMLElement) => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    const nextTheme = next === "system" ? systemTheme() : next;
    setPreferenceState(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch { /* Theme remains usable when storage is unavailable. */ }
    setResolvedTheme(applyTheme(next));

    if (previousTheme !== nextTheme && origin && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const bounds = origin.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(window.innerWidth - x, y),
        Math.hypot(x, window.innerHeight - y),
        Math.hypot(window.innerWidth - x, window.innerHeight - y),
      );
      setReveal({ x, y, radius, key: Date.now() });
    } else {
      setReveal(null);
    }
  }, []);

  const toggleTheme = useCallback((origin?: HTMLElement) => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setPreference(current === "dark" ? "light" : "dark", origin);
  }, [setPreference]);
  const context = useMemo(() => ({ preference, resolvedTheme, setPreference, toggleTheme }), [preference, resolvedTheme, setPreference, toggleTheme]);

  return <ThemeContext.Provider value={context}>
    {children}
    <AnimatePresence>
      {reveal && <motion.div
        key={reveal.key}
        aria-hidden="true"
        className="theme-reveal"
        initial={{ clipPath: `circle(0px at ${reveal.x}px ${reveal.y}px)` }}
        animate={{ clipPath: `circle(${reveal.radius}px at ${reveal.x}px ${reveal.y}px)` }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setReveal(null)}
      />}
    </AnimatePresence>
  </ThemeContext.Provider>;
}

export function useAppearanceTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppearanceTheme must be used inside ThemeProvider");
  return value;
}
