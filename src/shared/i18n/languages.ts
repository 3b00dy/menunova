import { isLocale, type Locale } from "@/shared/i18n/config";

/**
 * Catalog of **content languages** — the languages a restaurant can write its
 * menu in and a guest can read it in. Single source for every language picker
 * (settings, onboarding, Theme Builder) and the public-menu switcher.
 *
 * Deliberately separate from the app **UI locales** (`locales` in `config.ts`,
 * which drive the `/{locale}` route and the dictionaries): a content language
 * need not have a UI translation. Each entry names the `uiLocale` whose chrome
 * (buttons, labels) and route are used while a guest reads that language — e.g.
 * Sorani Kurdish content is shown with the Arabic UI (same script, RTL) until a
 * Kurdish dictionary exists.
 *
 * Kurdish uses the BCP-47 code `ckb` (Central Kurdish / Sorani, Arabic script,
 * RTL) — not `ku`, which usually means Kurmanji (Latin script, LTR).
 */
export interface LanguageDef {
  code: string;
  /** Native display name. */
  name: string;
  /** Short label for compact switchers (guests know "KU", not the `ckb` tag). */
  badge: string;
  dir: "ltr" | "rtl";
  /** UI locale used for the app chrome while this content language is shown. */
  uiLocale: Locale;
}

// Indexed by string so pickers can look up arbitrary code lists (a tenant's
// `supportedLanguages` is a string[]). Callers filter to known codes first.
export const SUPPORTED_LANGUAGES: Record<string, LanguageDef> = {
  en: { code: "en", name: "English", badge: "EN", dir: "ltr", uiLocale: "en" },
  ar: { code: "ar", name: "العربية", badge: "AR", dir: "rtl", uiLocale: "ar" },
  ckb: { code: "ckb", name: "کوردی", badge: "KU", dir: "rtl", uiLocale: "ar" },
};

export const LANGUAGE_CODES: string[] = Object.keys(SUPPORTED_LANGUAGES);

/** A restaurant can enable at most this many menu languages (BRD BR-RA-02). */
export const MAX_MENU_LANGUAGES = 3;

export function isMenuLanguage(code: string): boolean {
  return code in SUPPORTED_LANGUAGES;
}

/** Text direction for a content language (unknown codes → ltr). */
export function languageDir(code: string): "ltr" | "rtl" {
  return SUPPORTED_LANGUAGES[code]?.dir ?? "ltr";
}

/** UI locale whose chrome/route accompanies a content language. */
export function uiLocaleFor(code: string): Locale {
  if (isLocale(code)) return code;
  return SUPPORTED_LANGUAGES[code]?.uiLocale ?? "en";
}

/**
 * Pick the language a guest reads the public menu in, from only the languages
 * the restaurant enabled: an explicit `?lang=` request → the route's UI locale →
 * the restaurant default → its first enabled language.
 */
export function resolveMenuLanguage(input: {
  requested?: string;
  routeLocale: string;
  supported: string[];
  defaultLanguage: string;
}): string {
  const enabled = input.supported.filter(isMenuLanguage);
  if (input.requested && enabled.includes(input.requested)) return input.requested;
  if (enabled.includes(input.routeLocale)) return input.routeLocale;
  if (enabled.includes(input.defaultLanguage)) return input.defaultLanguage;
  return enabled[0] ?? input.routeLocale;
}
