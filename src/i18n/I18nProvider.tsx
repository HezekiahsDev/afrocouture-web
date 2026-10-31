"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_MAX_AGE,
  LOCALE_META,
  isLocale,
  type Locale,
} from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

type I18nValue = {
  /** The active language. */
  locale: Locale;
  /** Change language, persist it in a cookie, and re-render the app. */
  setLocale: (locale: Locale) => void;
  /** The dictionary for the active language. */
  t: Dictionary;
  meta: (typeof LOCALE_META)[Locale];
};

const I18nContext = createContext<I18nValue | null>(null);

function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  if (!match) return null;
  try {
    const value = decodeURIComponent(match[1]);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Holds the active language for the whole app.
 *
 * Locale lives in a cookie rather than the URL, so existing routes keep working
 * unchanged. Client components read copy through `useI18n()`; server components
 * can call `getDictionary(locale)` when they already know the locale.
 */
export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // The cookie is read after mount: it is not available while server rendering,
  // and reading it here keeps the root layout compatible with Cache Components.
  useEffect(() => {
    const stored = readLocaleCookie();
    if (stored && stored !== initialLocale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
    // Run once: later changes go through setLocale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { dir } = LOCALE_META[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    const secure =
      typeof location !== "undefined" && location.protocol === "https:"
        ? "; secure"
        : "";
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=${LOCALE_MAX_AGE}; samesite=lax${secure}`;
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
      meta: LOCALE_META[locale],
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
