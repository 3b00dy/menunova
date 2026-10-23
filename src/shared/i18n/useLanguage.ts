"use client";

import { usePathname, useRouter } from "next/navigation";
import { defaultLocale, isLocale } from "@/shared/i18n/config";
import {
  LANGUAGE_COOKIE_MAX_AGE,
  MENU_LANGUAGE_COOKIE,
  uiLocaleFor,
} from "@/shared/i18n/languages";

const LOCALE_COOKIE = "mn_locale";

/** Persist a language-preference cookie for a year. */
function setPrefCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${LANGUAGE_COOKIE_MAX_AGE}`;
}

/**
 * Next-native replacement for the source app's language context. Reads the
 * active locale from the URL's first segment and switches it by swapping that
 * segment and navigating (also persisting the choice in a cookie the proxy reads).
 */
export function useLanguage() {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/");
  const current = segments[1];
  const lang = isLocale(current) ? current : defaultLocale;

  /** Navigate to the same path under UI locale `ui`, with an optional query. */
  const navigate = (ui: string, query = "") => {
    const parts = pathname.split("/");
    if (isLocale(parts[1])) parts[1] = ui;
    else parts.splice(1, 0, ui);
    setPrefCookie(LOCALE_COOKIE, ui);
    router.push((parts.join("/") || `/${ui}`) + query);
  };

  /** Switch the app UI locale (route segment). */
  const setLang = (next: string) => navigate(next);

  /**
   * Switch the public menu's **content** language. UI locales (`en`, `ar`) map
   * straight to the route; other content languages (e.g. `ckb`) keep the route on
   * their companion UI locale and select the content via `?lang=`.
   */
  const setMenuLanguage = (code: string) => {
    setPrefCookie(MENU_LANGUAGE_COOKIE, code);
    navigate(uiLocaleFor(code), isLocale(code) ? "" : `?lang=${encodeURIComponent(code)}`);
  };

  /** Remember a menu language without navigating (it's already showing). */
  const rememberMenuLanguage = (code: string) => setPrefCookie(MENU_LANGUAGE_COOKIE, code);

  return { lang, setLang, setMenuLanguage, rememberMenuLanguage };
}
