import type { Locale } from "@/shared/i18n/config";
import type { LandingContent } from "@/features/marketing/domain/landing";
import { LandingNav } from "@/features/marketing/ui/LandingNav";
import { HeroSection } from "@/features/marketing/ui/HeroSection";
import { TrustStrip } from "@/features/marketing/ui/TrustStrip";
import { FeaturesSection } from "@/features/marketing/ui/FeaturesSection";
import { HowItWorksSection } from "@/features/marketing/ui/HowItWorksSection";
import { ThemeShowcase } from "@/features/marketing/ui/ThemeShowcase";
import { PricingSection } from "@/features/marketing/ui/PricingSection";
import { FaqSection } from "@/features/marketing/ui/FaqSection";
import { FinalCtaSection } from "@/features/marketing/ui/FinalCtaSection";
import { LandingFooter } from "@/features/marketing/ui/LandingFooter";

/**
 * Full marketing landing page. Server Component that composes the sections from
 * already-fetched {@link LandingContent}; the animated sections (Hero, Features)
 * are client islands. Fetching is the route's job (see the page).
 */
export function LandingPage({
  content,
  locale,
}: {
  content: LandingContent;
  locale: Locale;
}) {
  return (
    <div className="flex flex-1 flex-col bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
      <LandingNav content={content.nav} locale={locale} />
      <HeroSection content={content.hero} locale={locale} />
      <TrustStrip content={content.trust} />
      <FeaturesSection content={content.features} />
      <HowItWorksSection content={content.how} />
      <ThemeShowcase content={content.themes} locale={locale} />
      <PricingSection content={content.pricing} locale={locale} />
      <FaqSection content={content.faq} />
      <FinalCtaSection content={content.finalCta} locale={locale} />
      <LandingFooter content={content.footer} locale={locale} />
    </div>
  );
}
