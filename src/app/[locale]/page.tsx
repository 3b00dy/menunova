import type { Locale } from "@/shared/i18n/config";
import { getLandingContent, LandingPage } from "@/features/marketing";

/**
 * Marketing landing at "/{locale}". Lives directly under `[locale]` (not the
 * `(marketing)` group) so it uses the full-width root layout instead of the
 * centered marketing chrome — it renders its own nav/footer.
 *
 * Thin composition root: resolve locale, fetch content via the feature
 * use-case (mock today, API later), render the feature UI.
 */
export default async function LandingRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const content = await getLandingContent(locale);
  return <LandingPage content={content} locale={locale} />;
}
