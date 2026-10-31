/**
 * Supported languages for the IPILE web client.
 *
 * The choice is stored in a first-party cookie so it survives visits and can be
 * read by both the browser and (inside a Suspense boundary) the server.
 * Adding a language means: add it to `LOCALES`, add its metadata below, then add
 * a matching dictionary in `src/i18n/dictionaries/`.
 */
export const LOCALES = ["en", "ha", "yo", "ig"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie name shared by the provider and any future server-side readers. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** One year, in seconds. */
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_META: Record<
  Locale,
  { label: string; nativeName: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", nativeName: "English", dir: "ltr" },
  ha: { label: "Hausa", nativeName: "Hausa", dir: "ltr" },
  yo: { label: "Yoruba", nativeName: "Yorùbá", dir: "ltr" },
  ig: { label: "Igbo", nativeName: "Igbo", dir: "ltr" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
