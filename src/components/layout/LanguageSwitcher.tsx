"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES, LOCALE_META } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Language picker for the site header. `full` shows the current language on
 * wide screens; `icon` is the globe that sits beside the menu toggle on phones.
 * CSS shows one or the other at the 800px breakpoint.
 */
export default function LanguageSwitcher({
  variant = "full",
}: {
  variant?: "full" | "icon";
}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = LOCALE_META[locale];

  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector<HTMLElement>('[aria-checked="true"]')
      ?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focus = (next: number) => {
      event.preventDefault();
      items[(next + items.length) % items.length]?.focus();
    };
    switch (event.key) {
      case "ArrowDown":
        return focus(index + 1);
      case "ArrowUp":
        return focus(index - 1);
      case "Home":
        return focus(0);
      case "End":
        return focus(items.length - 1);
      case "Escape":
        event.preventDefault();
        return close();
      case "Tab":
        return setOpen(false);
    }
  }

  return (
    <div className={`lang-switcher lang-switcher-${variant}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="lang-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t.language.choose}: ${current.nativeName}`}
        title={t.language.choose}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Globe size={variant === "icon" ? 19 : 15} aria-hidden="true" />
        {variant === "full" && (
          <>
            <span>{current.nativeName}</span>
            <ChevronDown size={14} className="lang-chevron" aria-hidden="true" />
          </>
        )}
      </button>
      {open && (
        <div
          id={menuId}
          ref={menuRef}
          className="lang-menu"
          role="menu"
          aria-label={t.language.choose}
          onKeyDown={onMenuKeyDown}
        >
          <span className="lang-menu-title" aria-hidden="true">
            {t.language.label}
          </span>
          {LOCALES.map((code) => {
            const meta = LOCALE_META[code];
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={code === locale}
                tabIndex={-1}
                lang={code}
                onClick={() => {
                  setLocale(code);
                  close();
                }}
              >
                <span>
                  {meta.nativeName}
                  {meta.label !== meta.nativeName && (
                    <small lang="en">{meta.label}</small>
                  )}
                </span>
                {code === locale && <Check size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
