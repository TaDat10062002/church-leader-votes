"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { localeCookieName, locales, resolveLocale, translate, formatNumber, formatTime, type Locale, type MessageKey } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  number: (value: number) => string;
  time: (value: Date) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveLocale(initialLocale));
  const setLocale = useCallback((value: Locale) => {
    const next = locales.includes(value) ? value : "vi";
    setLocaleState(next);
    document.documentElement.lang = next;
    document.title = translate(next, "metadataTitle");
    document.querySelector('meta[name="description"]')?.setAttribute("content", translate(next, "metadataDescription"));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${localeCookieName}=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  }, []);
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values) => translate(locale, key, values),
    number: (number) => formatNumber(locale, number),
    time: (date) => formatTime(locale, date),
  }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
