/**
 * Localized content — text authored in multiple languages, keyed by locale code.
 *
 * Used for tenant-authored data (menu item/category names, descriptions) that a
 * restaurant enters in each language it supports. Distinct from the app UI
 * dictionary (`getDictionary`), which is developer-authored chrome.
 */
export type LocalizedText = Record<string, string>;

/**
 * Resolve localized text for a locale, falling back gracefully:
 * requested locale → `fallback` locale → first non-empty value → "".
 * This keeps rendering safe when a translation is missing.
 */
export function localize(
  text: LocalizedText | undefined,
  locale: string,
  fallback?: string,
): string {
  if (!text) return "";
  if (text[locale]?.trim()) return text[locale];
  if (fallback && text[fallback]?.trim()) return text[fallback];
  for (const value of Object.values(text)) {
    if (value?.trim()) return value;
  }
  return "";
}

/** Build a `LocalizedText` from a per-language input map, dropping empty entries. */
export function toLocalizedText(entries: Record<string, string>): LocalizedText {
  const out: LocalizedText = {};
  for (const [locale, value] of Object.entries(entries)) {
    const trimmed = value.trim();
    if (trimmed) out[locale] = trimmed;
  }
  return out;
}
