/**
 * i18n configuration — the single source of truth for supported locales.
 * Add a locale here + a matching `dictionaries/<locale>.json` file to expand.
 */

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Locales that render right-to-left. */
const rtlLocales: ReadonlySet<Locale> = new Set<Locale>(["ar"]);

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Text direction for a locale — drives the `<html dir>` attribute. */
export function dir(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}
