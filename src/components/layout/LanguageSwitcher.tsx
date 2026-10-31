"use client";

import { Globe } from "lucide-react";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Compact language picker for the site chrome. `tone` matches the surface it
 * sits on (dark header, light mobile menu).
 */
export default function LanguageSwitcher({
  tone = "dark",
}: {
  tone?: "dark" | "light";
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className={`lang-switcher lang-switcher-${tone}`}>
      <Globe size={15} aria-hidden="true" />
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t.language.choose}
        title={t.language.choose}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_META[code].nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
