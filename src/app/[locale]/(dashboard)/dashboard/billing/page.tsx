import { redirect } from "next/navigation";
import { Check, Clock3, Mail } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { env } from "@/shared/config/env";
import { routes } from "@/shared/config/routes";
import { Badge, Card, CardBody, CardHeader, EmptyState, PageHeader } from "@/shared/ui";
import { getRestaurantBySlug, statusTone } from "@/features/restaurant";
import { PLAN_MONTHLY_PRICE_USD, PLAN_ORDER, trialInfo } from "@/features/billing";
import { RestaurantScopePicker } from "@/app/[locale]/(dashboard)/_components/RestaurantScopePicker";
import { resolveSettingsScope } from "@/app/[locale]/(dashboard)/_lib/scope";

/**
 * Plan & billing (BRD BR-RA-07 / US-LP-03, MVP scope): the restaurant's plan,
 * its free-trial countdown, and the plan comparison. Online payment doesn't
 * exist yet — upgrades go through "Contact us" (`NEXT_PUBLIC_SUPPORT_EMAIL`), and
 * a super admin changes the plan on the Restaurants page. Read-only.
 */
export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const [sp, t] = await Promise.all([searchParams, getDictionary(locale)]);
  const scope = await resolveSettingsScope(sp.restaurant);
  if (!scope.allowed) redirect(routes.dashboard(locale));

  const b = t.dashboard.billingPage;
  const planText = t.onboarding.plan;
  const planNames = t.dashboard.restaurantsAdmin.plans;

  const restaurant = scope.slug ? await getRestaurantBySlug(scope.slug) : null;
  if (!scope.slug || !restaurant) {
    return (
      <EmptyState
        title={t.dashboard.menuAdmin.noRestaurants}
        description={t.dashboard.menuAdmin.noRestaurantsHint}
      />
    );
  }

  const trial = restaurant.status === "trial" ? trialInfo(restaurant.createdAt, new Date()) : null;
  const price = (plan: (typeof PLAN_ORDER)[number]) =>
    PLAN_MONTHLY_PRICE_USD[plan] === 0 ? planText.free : `$${PLAN_MONTHLY_PRICE_USD[plan]}`;
  const contactHref = (plan: (typeof PLAN_ORDER)[number]) =>
    env.supportEmail
      ? `mailto:${env.supportEmail}?subject=${encodeURIComponent(
          b.upgradeSubject.replace("{restaurant}", restaurant.name).replace("{plan}", planNames[plan]),
        )}`
      : null;

  return (
    <section className="flex flex-col gap-4">
      <PageHeader title={b.title} description={b.subtitle} />
      {scope.isSuperAdmin && (
        <RestaurantScopePicker
          restaurants={scope.restaurants.map((r) => ({ slug: r.slug, name: r.name }))}
          selected={restaurant.slug}
          scope="billing"
          label={t.dashboard.menuAdmin.restaurant}
        />
      )}

      {/* Current plan + trial */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[rgb(var(--color-text))]">{b.currentPlan}</span>
          <Badge tone={statusTone(restaurant.status)}>
            {t.dashboard.restaurantsAdmin.statuses[restaurant.status]}
          </Badge>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 pt-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[rgb(var(--color-text))]">
              {planNames[restaurant.plan]}
            </span>
            <span className="text-sm text-[rgb(var(--color-muted))]">
              {price(restaurant.plan)}
              {PLAN_MONTHLY_PRICE_USD[restaurant.plan] > 0 && planText.perMonth}
            </span>
          </div>
          {trial && (
            <div
              className={`flex items-start gap-2 rounded-[var(--radius-active)] px-3 py-2 text-sm ${
                trial.expired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
              }`}
            >
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {trial.expired ? (
                  b.trialExpired
                ) : (
                  <>
                    {b.trialDaysLeft.replace("{days}", String(trial.daysLeft))}{" "}
                    {b.trialEnds.replace(
                      "{date}",
                      new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(trial.endsAt),
                    )}
                  </>
                )}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Plan comparison */}
      <h2 className="mt-2 text-lg font-semibold text-[rgb(var(--color-text))]">{b.plans}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const current = plan === restaurant.plan;
          const href = contactHref(plan);
          return (
            <Card
              key={plan}
              className={current ? "ring-2 ring-[rgb(var(--color-primary))]" : undefined}
            >
              <CardBody className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[rgb(var(--color-text))]">{planNames[plan]}</span>
                  {current && <Badge tone="info">{b.current}</Badge>}
                </div>
                <p className="text-sm text-[rgb(var(--color-muted))]">{planText.items[plan].tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-[rgb(var(--color-text))]">{price(plan)}</span>
                  {PLAN_MONTHLY_PRICE_USD[plan] > 0 && (
                    <span className="text-sm text-[rgb(var(--color-muted))]">{planText.perMonth}</span>
                  )}
                </div>
                <ul className="flex flex-1 flex-col gap-1.5 text-sm text-[rgb(var(--color-text))]">
                  {planText.items[plan].features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!current && href && (
                  <a
                    href={href}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] text-sm font-medium text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]"
                  >
                    <Mail className="h-4 w-4" />
                    {b.contact}
                  </a>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
      <p className="text-sm text-[rgb(var(--color-muted))]">{b.paymentsNote}</p>
    </section>
  );
}
