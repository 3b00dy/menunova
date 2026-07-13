import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import type {
  PricingContent,
  PricingPlan,
} from "@/features/marketing/domain/landing";

/** Pricing tiers. Server-rendered; CTAs route to registration. */
export function PricingSection({
  content,
  locale,
}: {
  content: PricingContent;
  locale: Locale;
}) {
  return (
    <section id="pricing" className="bg-[rgb(var(--color-surface))] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
            {content.label}
          </span>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="mt-3 text-[rgb(var(--color-muted))]">{content.subtitle}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl items-start gap-6 md:grid-cols-3">
          {content.plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              locale={locale}
              mostPopularLabel={content.mostPopular}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[rgb(var(--color-muted))]">{content.note}</p>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  locale,
  mostPopularLabel,
}: {
  plan: PricingPlan;
  locale: Locale;
  mostPopularLabel: string;
}) {
  return (
    <div className="relative rounded-3xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] p-8 shadow-xl">
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[rgb(var(--color-primary))] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary-fg))]">
          <Sparkles className="h-3 w-3" /> {mostPopularLabel}
        </span>
      )}
      <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
        {plan.name}
      </div>
      <div className="mt-1 text-sm text-[rgb(var(--color-muted))]">{plan.description}</div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-semibold">{plan.price}</span>
        <span className="text-[rgb(var(--color-muted))]">{plan.period}</span>
      </div>
      {plan.priceNote && (
        <div className="mt-0.5 text-xs text-[rgb(var(--color-muted))]">{plan.priceNote}</div>
      )}
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3 w-3" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={routes.register(locale)} className="mt-8 block">
        <Button size="lg" variant={plan.highlighted ? "primary" : "outline"} block>
          {plan.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
