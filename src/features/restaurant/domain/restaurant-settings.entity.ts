import { isMenuLanguage, MAX_MENU_LANGUAGES } from "@/shared/i18n/languages";

/**
 * Restaurant settings the admin controls. Currently the language configuration:
 * which languages the menu is offered in, and which is the default/fallback.
 * `supportedLanguages` always includes `defaultLanguage`.
 */
export interface RestaurantSettings {
  slug: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

/**
 * Normalize a language selection: drop codes outside the content-language
 * catalog, dedupe, and guarantee the default is included (listed first).
 * Throws when the default is unknown or more than {@link MAX_MENU_LANGUAGES}
 * languages are selected — the UI prevents both, so this guards direct calls.
 */
export function normalizeLanguages(input: {
  defaultLanguage: string;
  supportedLanguages: string[];
}): { defaultLanguage: string; supportedLanguages: string[] } {
  if (!isMenuLanguage(input.defaultLanguage)) {
    throw new Error(`Unsupported default language: ${input.defaultLanguage}`);
  }
  const set = new Set([input.defaultLanguage, ...input.supportedLanguages.filter(isMenuLanguage)]);
  if (set.size > MAX_MENU_LANGUAGES) {
    throw new Error(`A restaurant can enable at most ${MAX_MENU_LANGUAGES} languages.`);
  }
  return {
    defaultLanguage: input.defaultLanguage,
    supportedLanguages: Array.from(set),
  };
}
