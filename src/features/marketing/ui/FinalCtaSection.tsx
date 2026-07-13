import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import type { FinalCtaContent } from "@/features/marketing/domain/landing";

/** Closing call-to-action banner. Server-rendered. */
export function FinalCtaSection({
  content,
  locale,
}: {
  content: FinalCtaContent;
  locale: Locale;
}) {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[rgb(var(--color-primary))] p-10 text-center text-[rgb(var(--color-primary-fg))] sm:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <h2 className="relative text-3xl font-semibold leading-tight sm:text-5xl">
            {content.title}
          </h2>
          <p className="relative mt-3 opacity-80">{content.subtitle}</p>
          <Link href={routes.register(locale)} className="relative mt-7 inline-block">
            <Button size="lg" variant="secondary">
              {content.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
