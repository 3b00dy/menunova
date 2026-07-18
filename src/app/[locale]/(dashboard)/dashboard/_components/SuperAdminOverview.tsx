import Link from "next/link";
import type { ComponentType } from "react";
import {
  Building2,
  CircleCheck,
  Clock3,
  CircleSlash,
  UtensilsCrossed,
  FolderTree,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { Badge, Card, CardBody, CardHeader, PageHeader } from "@/shared/ui";
import { statusTone, type PlatformStats } from "@/features/restaurant";

type Icon = ComponentType<{ className?: string }>;

/**
 * Super-admin platform overview: at-a-glance health of every restaurant on the
 * platform, derived from the tenant list (+ aggregate menu totals). Fully
 * server-rendered (inline CSS charts, no client JS). Status uses the reserved
 * green/amber/red tones; magnitude (plans) uses a single-hue bar.
 */
export function SuperAdminOverview({
  stats,
  menuItems,
  menuCategories,
  dict,
  locale,
}: {
  stats: PlatformStats;
  menuItems: number;
  menuCategories: number;
  dict: Dictionary["dashboard"];
  locale: Locale;
}) {
  const p = dict.platform;
  const planLabel = (plan: PlatformStats["byPlan"][number]["plan"]) => dict.restaurantsAdmin.plans[plan];
  const statusLabel = (s: PlatformStats["byStatus"][number]["status"]) => dict.restaurantsAdmin.statuses[s];
  const fmtDate = (iso?: string) =>
    iso ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso)) : "—";

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={p.title}
        description={p.subtitle}
        actions={
          <Link
            href={routes.dashboardRestaurants(locale)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-active)] bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-medium text-[rgb(var(--color-primary-fg))] hover:opacity-90"
          >
            <Building2 className="h-4 w-4" />
            {p.actions.manageRestaurants}
          </Link>
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Building2} label={p.kpis.restaurants} value={stats.total} tone="primary" />
        <StatTile icon={CircleCheck} label={p.kpis.active} value={stats.activeCount} tone="success" />
        <StatTile icon={Clock3} label={p.kpis.trial} value={stats.trialCount} tone="warning" />
        <StatTile
          icon={CircleSlash}
          label={p.kpis.suspended}
          value={stats.suspendedCount}
          tone={stats.suspendedCount > 0 ? "danger" : "muted"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plans (magnitude — single hue) */}
        <Card>
          <CardHeader className="text-sm font-semibold text-[rgb(var(--color-text))]">
            {p.sections.byPlan}
          </CardHeader>
          <CardBody>
            <PlanBars items={stats.byPlan} total={stats.total} label={planLabel} />
          </CardBody>
        </Card>

        {/* Statuses (state — reserved colors) + menu totals */}
        <Card>
          <CardHeader className="text-sm font-semibold text-[rgb(var(--color-text))]">
            {p.sections.byStatus}
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <StatusBar stats={stats} label={statusLabel} emptyLabel={p.recent.empty} />
            <div className="grid grid-cols-2 gap-3 border-t border-[rgb(var(--color-border))] pt-4">
              <MiniStat icon={UtensilsCrossed} label={p.kpis.menuItems} value={menuItems} />
              <MiniStat icon={FolderTree} label={p.kpis.categories} value={menuCategories} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent restaurants */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[rgb(var(--color-text))]">{p.sections.recent}</span>
          <Link
            href={routes.dashboardRestaurants(locale)}
            className="inline-flex items-center gap-1 text-sm font-medium text-[rgb(var(--color-primary))] hover:underline"
          >
            {p.actions.viewAll}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {stats.recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[rgb(var(--color-muted))]">{p.recent.empty}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[rgb(var(--color-border))]">
              {stats.recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-primary))]/10 text-sm font-semibold text-[rgb(var(--color-primary))]"
                  >
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-[rgb(var(--color-text))]">{r.name}</div>
                    <div className="truncate text-sm text-[rgb(var(--color-muted))]">/{r.slug}</div>
                  </div>
                  <Badge tone="info">{planLabel(r.plan)}</Badge>
                  <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>
                  <span className="hidden w-24 shrink-0 text-end text-sm text-[rgb(var(--color-muted))] sm:inline">
                    {fmtDate(r.createdAt)}
                  </span>
                  <Link
                    href={routes.publicMenu(locale, r.slug)}
                    target="_blank"
                    aria-label={p.recent.view}
                    className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------

const TONE_CHIP: Record<string, string> = {
  primary: "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-[rgb(var(--color-bg))] text-[rgb(var(--color-muted))]",
};

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: Icon;
  label: string;
  value: number;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
}) {
  return (
    <Card className="p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-full ${TONE_CHIP[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-[rgb(var(--color-text))]">{value}</div>
      <div className="text-sm text-[rgb(var(--color-muted))]">{label}</div>
    </Card>
  );
}

function PlanBars({
  items,
  total,
  label,
}: {
  items: PlatformStats["byPlan"];
  total: number;
  label: (plan: PlatformStats["byPlan"][number]["plan"]) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it) => (
        <li key={it.plan} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-[rgb(var(--color-text))]">{label(it.plan)}</span>
          <div className="h-2.5 flex-1 rounded-full bg-[rgb(var(--color-bg))]">
            <div
              className="h-full rounded-full bg-[rgb(var(--color-primary))]"
              style={{ width: `${it.count === 0 ? 0 : Math.max(6, (it.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-end text-sm font-medium tabular-nums text-[rgb(var(--color-text))]">
            {it.count}
          </span>
          <span className="w-10 shrink-0 text-end text-xs tabular-nums text-[rgb(var(--color-muted))]">
            {total === 0 ? 0 : Math.round((it.count / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

const STATUS_FILL: Record<string, string> = {
  active: "bg-emerald-500",
  trial: "bg-amber-500",
  suspended: "bg-red-500",
};
const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  trial: "bg-amber-500",
  suspended: "bg-red-500",
};

function StatusBar({
  stats,
  label,
  emptyLabel,
}: {
  stats: PlatformStats;
  label: (s: PlatformStats["byStatus"][number]["status"]) => string;
  emptyLabel: string;
}) {
  if (stats.total === 0) {
    return <p className="text-sm text-[rgb(var(--color-muted))]">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[rgb(var(--color-bg))]">
        {stats.byStatus.map((s) =>
          s.count > 0 ? (
            <div
              key={s.status}
              className={`h-full ${STATUS_FILL[s.status]}`}
              style={{ width: `${(s.count / stats.total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {stats.byStatus.map((s) => (
          <span key={s.status} className="inline-flex items-center gap-1.5 text-[rgb(var(--color-muted))]">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[s.status]}`} />
            {label(s.status)}{" "}
            <span className="font-medium tabular-nums text-[rgb(var(--color-text))]">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: Icon; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgb(var(--color-bg))] text-[rgb(var(--color-muted))]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-lg font-semibold tabular-nums text-[rgb(var(--color-text))]">{value}</div>
        <div className="text-xs text-[rgb(var(--color-muted))]">{label}</div>
      </div>
    </div>
  );
}
