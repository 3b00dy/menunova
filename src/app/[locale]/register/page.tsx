import { OnboardingWizard } from "@/features/auth/ui/OnboardingWizard";

/**
 * Registration — "/{locale}/register". A standalone, full-bleed onboarding
 * wizard (its own header/chrome), so it lives directly under `[locale]` rather
 * than inside the marketing/auth card layouts. It creates the owner account,
 * provisions the restaurant + language settings, and lands them in the dashboard.
 */
export default function RegisterPage() {
  return <OnboardingWizard />;
}
