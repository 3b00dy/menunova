import { cookies } from "next/headers";
import {
  isMenuLanguage,
  MENU_LANGUAGE_COOKIE,
  resolveMenuLanguage,
  uiLocaleFor,
} from "@/shared/i18n/languages";

/**
 * Server-only (reads cookies — import from route files, never from components):
 * choose the public menu's content language for this request.
 *
 * Order: explicit `?lang=` → the language remembered on this device → route
 * locale → restaurant default. The remembered choice is only used when it
 * belongs to the current route's UI locale, so an explicit `/en/…` or `/ar/…`
 * link is never overridden by an older preference.
 *
 * `askLanguage` is true on a first visit (no `?lang=`, nothing remembered) to a
 * restaurant with more than one language — the page shows the language splash.
 */
export async function resolveRequestMenuLanguage(input: {
  requested?: string;
  routeLocale: string;
  supported: string[];
  defaultLanguage: string;
}): Promise<{ language: string; askLanguage: boolean }> {
  const remembered = (await cookies()).get(MENU_LANGUAGE_COOKIE)?.value;
  const usable =
    remembered && isMenuLanguage(remembered) && uiLocaleFor(remembered) === input.routeLocale
      ? remembered
      : undefined;

  const language = resolveMenuLanguage({ ...input, requested: input.requested ?? usable });
  const enabledCount = input.supported.filter(isMenuLanguage).length;
  return { language, askLanguage: !input.requested && !remembered && enabledCount > 1 };
}
