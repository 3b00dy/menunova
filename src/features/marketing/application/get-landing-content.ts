import type { Locale } from "@/shared/i18n/config";
import { defaultLocale } from "@/shared/i18n/config";
import type { LandingContent } from "@/features/marketing/domain/landing";
import { LANDING_CONTENT } from "@/features/marketing/infrastructure/landing.mock";

/**
 * Query use-case: fetch the localized landing-page content.
 *
 * Currently backed by bundled mock data. To move it to the real backend/CMS,
 * replace the body with an `httpClient` call — the return type and every
 * consumer stay unchanged. Kept `async` so that swap is non-breaking.
 */
export async function getLandingContent(locale: Locale): Promise<LandingContent> {
  return LANDING_CONTENT[locale] ?? LANDING_CONTENT[defaultLocale];
}
