import { locales, type Locale } from "@/shared/i18n/config";

/**
 * Human-facing language catalog for pickers. Mirrors the supported {@link locales}
 * (Arabic + English now; add entries here as locales grow).
 */
export interface LanguageDef {
  code: Locale;
  name: string;
  dir: "ltr" | "rtl";
}

// Indexed by string so pickers can look up arbitrary code lists (a tenant's
// `supportedLanguages` is a string[]). Callers filter to known codes first.
export const SUPPORTED_LANGUAGES: Record<string, LanguageDef> = {
  en: { code: "en", name: "English", dir: "ltr" },
  ar: { code: "ar", name: "العربية", dir: "rtl" },
};

export const LANGUAGE_CODES: Locale[] = [...locales];
