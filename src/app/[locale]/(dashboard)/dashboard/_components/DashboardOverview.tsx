import Link from "next/link";
import type { ComponentType } from "react";
import {
  FolderTree,
  UtensilsCrossed,
  CircleCheck,
  Palette,
  Languages,
  ExternalLink,
  Building2,
  ArrowRight,
  Users,
} from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/getDictionary";
import { localize } from "@/shared/i18n/localized";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { routes } from "@/shared/config/routes";
import { Badge, Card, CardBody, CardHeader, PageHeader } from "@/shared/ui";
import type { MenuStats } from "@/features/menu";
import { statusTone, type Restaurant } from "@/features/restaurant";
import type { DashboardCapabilities } from "@/app/[locale]/(dashboard)/_lib/access";

type Icon = ComponentType<{ className?: string }>;

const langName = (code: string) => SUPPORTED_LANGUAGES[code]?.name ?? code.toUpperCase();

/**
 * Restaurant-admin overview: at-a-glance insights derived from the restaurant's
 * own menu + account data. Fully server-rendered (inline CSS charts, no client
 * JS). Colors map to the app's semantic tokens; availability uses reserved
 * status colors (green/red) with labels.
 */
export function DashboardOverview({
  restaurant,
  supportedLanguages,
  defaultLanguage,
  stats,
  dict,
  locale,
  caps,
}: {
  restaurant: Restaurant;
  supportedLanguages: string[];
  defaultLanguage: string;
  stats: MenuStats;
  dict: Dictionary["dashboard"];
  locale: Locale;
  caps: DashboardCapabilities;
}) {
  const o = dict.overview;
  const createdAt = restaurant.createdAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(restaurant.createdAt))
    : null;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={restaurant.name}
        description={o.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="info">{dict.restaurantsAdmin.plans[restaurant.plan]}</Badge>
            <Badge tone={statusTone(restaurant.status)}>
              {dict.restaurantsAdmin.statuses[restaurant.status]}
            </Badge>
          </div>
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile icon={FolderTree} label={o.kpis.categories} value={stats.categoryCount} />
        <StatTile icon={UtensilsCrossed} label={o.kpis.items} value={stats.itemCount} />
        <StatTile
          icon={CircleCheck}
          label={o.kpis.available}
          value={stats.availableCount}
          sub={`${stats.availablePct}%`}
          tone="success"
        />
        {/* <StatTile
          icon={CircleSlash}
          label={o.kpis.outOfStock}
          value={stats.unavailableCount}
          tone={stats.unavailableCount > 0 ? "danger" : "muted"}
        /> */}
      </div>



      {/* Menu completeness + account */}
      <div className="grid gap-4 lg:grid-cols-3">


        <Card>
          <CardHeader className="text-sm font-semibold text-[rgb(var(--color-text))]">
            {o.sections.account}
          </CardHeader>
          <CardBody>
            <dl className="divide-y divide-[rgb(var(--color-border))]">
              <AccountRow label={o.account.slug} value={`/${restaurant.slug}`} />
              <AccountRow
                label={o.account.languages}
                value={supportedLanguages
                  .map((l) => (l === defaultLanguage ? `${langName(l)} ★` : langName(l)))
                  .join("، ")}
              />
              {restaurant.ownerEmail && <AccountRow label={o.account.owner} value={restaurant.ownerEmail} />}
              {createdAt && <AccountRow label={o.account.created} value={createdAt} />}
              <div className="pt-2.5">
                <Link
                  href={routes.publicMenu(locale, restaurant.slug)}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--color-primary))] hover:underline"
                >
                  {o.account.viewPublicMenu}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </dl>
          </CardBody>
        </Card>
        {/* Quick actions — gated to the current role's capabilities */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 col-span-2">
          {caps.menu && (
            <QuickAction href={routes.dashboardMenu(locale)} icon={UtensilsCrossed} label={o.actions.manageMenu} />
          )}
          {caps.theme && (
            <QuickAction href={routes.dashboardTheme(locale)} icon={Palette} label={o.actions.customizeTheme} />
          )}
          {caps.settings && (
            <QuickAction href={routes.dashboardRestaurant(locale)} icon={Languages} label={o.actions.languages} />
          )}
          {caps.staff && (
            <QuickAction href={routes.dashboardStaff(locale)} icon={Users} label={o.actions.manageStaff} />
          )}
          {caps.restaurants ? (
            <QuickAction href={routes.dashboardRestaurants(locale)} icon={Building2} label={dict.allRestaurants} />
          ) : (
            <QuickAction href={routes.publicMenu(locale, restaurant.slug)} icon={ExternalLink} label={o.account.viewPublicMenu} external />
          )}
        </div>
      </div>


    </section>
  );
}

// ---------------------------------------------------------------------------

const TONE_CHIP: Record<string, string> = {
  primary: "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-[rgb(var(--color-bg))] text-[rgb(var(--color-muted))]",
};

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
}: {
  icon: Icon;
  label: string;
  value: number;
  sub?: string;
  tone?: "primary" | "success" | "danger" | "muted";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${TONE_CHIP[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        {sub && <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{sub}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-[rgb(var(--color-text))]">{value}</div>
      <div className="text-sm text-[rgb(var(--color-muted))]">{label}</div>
    </Card>
  );
}

function CategoryBars({
  items,
  locale,
  defaultLanguage,
  emptyLabel,
}: {
  items: MenuStats["itemsPerCategory"];
  locale: Locale;
  defaultLanguage: string;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="py-4 text-sm text-[rgb(var(--color-muted))]">{emptyLabel}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((c) => (
        <li key={c.id} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-[rgb(var(--color-text))]">
            {localize(c.name, locale, defaultLanguage)}
          </span>
          <div className="h-2.5 flex-1 rounded-full bg-[rgb(var(--color-bg))]">
            <div
              className="h-full rounded-full bg-[rgb(var(--color-primary))]"
              style={{ width: `${Math.max(c.count === 0 ? 0 : 6, (c.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-end text-sm font-medium tabular-nums text-[rgb(var(--color-text))]">
            {c.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AvailabilityBar({
  available,
  soldOut,
  total,
  labels,
}: {
  available: number;
  soldOut: number;
  total: number;
  labels: Dictionary["dashboard"]["overview"];
}) {
  if (total === 0) {
    return <p className="text-sm text-[rgb(var(--color-muted))]">{labels.emptyMenu}</p>;
  }
  const availPct = (available / total) * 100;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[rgb(var(--color-bg))]">
        {available > 0 && <div className="h-full bg-emerald-500" style={{ width: `${availPct}%` }} />}
        {soldOut > 0 && <div className="h-full bg-red-500" style={{ width: `${100 - availPct}%` }} />}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-[rgb(var(--color-muted))]">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {labels.availability_available} <span className="font-medium tabular-nums text-[rgb(var(--color-text))]">{available}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[rgb(var(--color-muted))]">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          {labels.availability_soldOut} <span className="font-medium tabular-nums text-[rgb(var(--color-text))]">{soldOut}</span>
        </span>
      </div>
    </div>
  );
}

function Meter({ label, pct, emphasis }: { label: string; pct: number; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={emphasis ? "font-medium text-[rgb(var(--color-text))]" : "text-[rgb(var(--color-muted))]"}>
          {label}
        </span>
        <span className="font-medium tabular-nums text-[rgb(var(--color-text))]">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[rgb(var(--color-bg))]">
        <div className="h-full rounded-full bg-[rgb(var(--color-primary))]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MiniRow({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-2 text-[rgb(var(--color-muted))]">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-medium tabular-nums text-[rgb(var(--color-text))]">{value}</span>
    </div>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-[rgb(var(--color-muted))]">{label}</dt>
      <dd className="truncate text-sm font-medium text-[rgb(var(--color-text))]">{value}</dd>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: Icon;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="group flex items-center gap-3 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 transition-colors hover:border-[rgb(var(--color-primary))]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 text-sm font-medium text-[rgb(var(--color-text))]">{label}</span>
      <ArrowRight className="h-4 w-4 text-[rgb(var(--color-muted))] transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
    </Link>
  );
}
