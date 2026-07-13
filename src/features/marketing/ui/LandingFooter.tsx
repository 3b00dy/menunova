import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { BrandBadge, BrandWordmark } from "@/shared/ui";
import type { FooterContent } from "@/features/marketing/domain/landing";

/** Landing footer. Server-rendered. */
export function LandingFooter({
  content,
  locale,
}: {
  content: FooterContent;
  locale: Locale;
}) {
  return (
    <footer className="border-t border-[rgb(var(--color-border))] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-[rgb(var(--color-muted))] sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <BrandBadge size="sm" />
          <BrandWordmark className="text-[rgb(var(--color-text))]" />
          <span>· {content.tagline}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-[rgb(var(--color-text))]">
            {content.features}
          </a>
          <a href="#pricing" className="hover:text-[rgb(var(--color-text))]">
            {content.pricing}
          </a>
          <Link href={routes.login(locale)} className="hover:text-[rgb(var(--color-text))]">
            {content.signIn}
          </Link>
        </div>
      </div>
    </footer>
  );
}
