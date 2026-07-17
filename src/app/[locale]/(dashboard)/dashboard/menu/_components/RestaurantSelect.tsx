"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";

/**
 * Super-admin restaurant picker for the menu page. A super admin belongs to no
 * single restaurant, so they choose which tenant's menu to manage; the choice
 * lives in the `?restaurant=<slug>` query param (bookmarkable, server-resolved).
 * Owners/staff never see this — their menu is scoped to their own restaurant.
 */
export function RestaurantSelect({
  restaurants,
  selected,
}: {
  restaurants: { slug: string; name: string }[];
  selected: string;
}) {
  const { locale, dictionary: t } = useI18n();
  const a = t.dashboard.menuAdmin;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--color-text))]">
        <Store className="h-4 w-4 text-[rgb(var(--color-muted))]" />
        {a.restaurant}
      </span>
      <select
        value={selected}
        disabled={pending}
        aria-label={a.restaurant}
        onChange={(e) => {
          const slug = e.target.value;
          startTransition(() => {
            router.push(`${routes.dashboardMenu(locale)}?restaurant=${encodeURIComponent(slug)}`);
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
