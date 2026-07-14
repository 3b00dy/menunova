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

/** Normalize a language selection: dedupe, guarantee the default is included. */
export function normalizeLanguages(input: {
  defaultLanguage: string;
  supportedLanguages: string[];
}): { defaultLanguage: string; supportedLanguages: string[] } {
  const set = new Set(input.supportedLanguages);
  set.add(input.defaultLanguage);
  return {
    defaultLanguage: input.defaultLanguage,
    supportedLanguages: Array.from(set),
  };
}
