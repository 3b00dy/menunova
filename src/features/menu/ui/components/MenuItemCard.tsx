import type { MenuItem } from "@/features/menu/domain/menu.entity";
import { localize } from "@/shared/i18n/localized";
import { formatMoney } from "@/shared/utils/formatMoney";
import { Card } from "@/shared/ui/Card";

/** Presentational card for a single menu item. Server Component (no interactivity). */
export function MenuItemCard({
  item,
  locale,
  fallback,
}: {
  item: MenuItem;
  /** Content language (e.g. `en`, `ar`, `ckb`). */
  locale: string;
  /** Restaurant default language, used when a translation is missing. */
  fallback?: string;
}) {
  const description = localize(item.description, locale, fallback);
  return (
    <Card className="flex items-start justify-between gap-4 p-4">
      <div>
        <h3 className="font-medium text-[rgb(var(--color-text))]">{localize(item.name, locale, fallback)}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[rgb(var(--color-muted))]">
            {description}
          </p>
        ) : null}
        {!item.available ? (
          <span className="mt-2 inline-block text-xs text-red-600">Unavailable</span>
        ) : null}
      </div>
      <span className="shrink-0 font-mono text-sm text-[rgb(var(--color-text))]">
        {formatMoney(item.price, locale)}
      </span>
    </Card>
  );
}
