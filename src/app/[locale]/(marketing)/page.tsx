import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

/** Landing page — "/{locale}". */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);

  return (
    <section className="flex flex-col items-start gap-6">
      <h1 className="text-4xl font-semibold tracking-tight max-w-2xl">
        {t.marketing.heroTitle}
      </h1>
      <p className="text-lg text-[rgb(var(--color-muted))] max-w-xl">
        {t.marketing.heroSubtitle}
      </p>
      <Link href={routes.onboarding(locale)}>
        <Button>{t.common.getStarted}</Button>
      </Link>
    </section>
  );
}
