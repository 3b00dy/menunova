"use client";

import { usePathname, useRouter } from "next/navigation";
import { defaultLocale, isLocale } from "@/shared/i18n/config";

const LOCALE_COOKIE = "mn_locale";

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

  const setLang = (next: string) => {
    const parts = pathname.split("/");
    if (isLocale(parts[1])) parts[1] = next;
    else parts.splice(1, 0, next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/`;
    router.push(parts.join("/") || `/${next}`);
  };

  return { lang, setLang };
}
