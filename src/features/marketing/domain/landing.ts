/**
 * Content model for the marketing landing page. Today it's served from a mock
 * (see `infrastructure/landing.mock.ts`); the shape is designed so it can later
 * come from a CMS/API without touching the UI. All copy is data, not hardcoded.
 */

export interface NavContent {
  features: string;
  howItWorks: string;
  themes: string;
  pricing: string;
  signIn: string;
  getStarted: string;
}

export interface HeroPreviewItem {
  name: string;
  price: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  /** Three short trust bullets under the CTAs. */
  trust: string[];
  /** Slug the "view a live menu" CTA links to. */
  demoSlug: string;
  preview: {
    tonightLabel: string;
    restaurantName: string;
    imageUrl: string;
    items: HeroPreviewItem[];
  };
  floatingScans: { label: string; sub: string };
  floatingTheme: { label: string; sub: string };
}

export interface TrustContent {
  label: string;
  brands: string[];
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesContent {
  label: string;
  title: string;
  items: FeatureItem[];
}

export interface HowStep {
  title: string;
  description: string;
}

export interface HowContent {
  label: string;
  title: string;
  items: HowStep[];
}

export interface DemoRestaurant {
  slug: string;
  name: string;
}

export interface ThemesContent {
  label: string;
  title: string;
  subtitle: string;
  demos: DemoRestaurant[];
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  /** Optional secondary price line, e.g. "+ $25 / branch". */
  priceNote?: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
}

export interface PricingContent {
  label: string;
  title: string;
  subtitle: string;
  note: string;
  mostPopular: string;
  plans: PricingPlan[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqContent {
  label: string;
  title: string;
  items: FaqItem[];
}

export interface FinalCtaContent {
  title: string;
  subtitle: string;
  cta: string;
}

export interface FooterContent {
  tagline: string;
  features: string;
  pricing: string;
  signIn: string;
}

export interface LandingContent {
  nav: NavContent;
  hero: HeroContent;
  trust: TrustContent;
  features: FeaturesContent;
  how: HowContent;
  themes: ThemesContent;
  pricing: PricingContent;
  faq: FaqContent;
  finalCta: FinalCtaContent;
  footer: FooterContent;
}
