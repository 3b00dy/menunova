// NOTE: This module is server-only by convention (used from Server Components /
// layouts). Add the `server-only` package later to enforce it at build time.
import type { Locale } from "@/shared/i18n/config";
import type en from "@/shared/i18n/dictionaries/en.json";

/** The dictionary shape is inferred from the English source of truth. */
export type Dictionary = typeof en;

/**
 * Server-side dictionary loader. Uses dynamic import so each locale's JSON is
 * code-split and only the requested one is sent over the wire.
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/shared/i18n/dictionaries/en.json").then((m) => m.default),
  ar: () => import("@/shared/i18n/dictionaries/ar.json").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
