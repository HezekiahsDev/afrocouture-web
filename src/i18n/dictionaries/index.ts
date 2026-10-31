import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { ha } from "./ha";
import { ig } from "./ig";
import { yo } from "./yo";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, ha, yo, ig };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Useful for server components: `const t = getDictionary(await resolveLocale())`. */
export { en, ha, yo, ig };
