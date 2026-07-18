"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import type { Locale } from "@/shared/i18n/config";

/** Which dashboard section the picker scopes — maps to the route it pushes to. */
export type PickerScope = "menu" | "theme" | "settings";

const ROUTE_FOR: Record<PickerScope, (locale: Locale) => string> = {
  menu: routes.dashboardMenu,
  theme: routes.dashboardTheme,
  settings: routes.dashboardRestaurant,
};

/**
 * Super-admin restaurant picker. A super admin belongs to no single restaurant,
 * so on the platform-wide pages (menu / theme / settings) they choose which
 * tenant to act on; the choice lives in `?restaurant=<slug>` (bookmarkable,
 * server-resolved). Owners/staff never see this — those pages scope to their own
 * restaurant.
 */
export function RestaurantScopePicker({
  restaurants,
  selected,
  scope,
  label,
}: {
  restaurants: { slug: string; name: string }[];
  selected: string;
  scope: PickerScope;
  label: string;
}) {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--color-text))]">
        <Store className="h-4 w-4 text-[rgb(var(--color-muted))]" />
        {label}
      </span>
      <select
        value={selected}
        disabled={pending}
        aria-label={label}
        onChange={(e) => {
          const slug = e.target.value;
          startTransition(() => {
            router.push(`${ROUTE_FOR[scope](locale)}?restaurant=${encodeURIComponent(slug)}`);
          });
        }}
        className="h-10 min-w-56 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] disabled:opacity-60"
      >
        {restaurants.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
