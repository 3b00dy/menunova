import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { BrandLogo, LanguagePicker } from "@/shared/ui";

/** Marketing chrome (nav + footer) shared by landing, pricing, auth, onboarding. */
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--color-border))]">
        <Link href={routes.home(locale)}>
          <BrandLogo />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href={routes.pricing(locale)}
            className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
          >
            {t.marketing.seePricing}
          </Link>
          <Link
            href={routes.login(locale)}
            className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
          >
            {t.common.signIn}
          </Link>
          <LanguagePicker compact />
        </nav>
      </header>
      <main className="flex flex-1 flex-col px-6 py-16 max-w-4xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
