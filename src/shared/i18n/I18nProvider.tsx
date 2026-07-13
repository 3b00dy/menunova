"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/getDictionary";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Makes the server-loaded dictionary available to Client Components.
 * The dictionary itself is fetched on the server (see `getDictionary`) and
 * passed down as a serializable prop — no client-side i18n fetching.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/** Convenience hook returning the current locale's dictionary. */
export function useTranslations(): Dictionary {
  return useI18n().dictionary;
}
