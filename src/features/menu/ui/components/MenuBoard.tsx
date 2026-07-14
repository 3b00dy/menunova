import type { Menu } from "@/features/menu/domain/menu.entity";
import { itemsInCategory, visibleCategories } from "@/features/menu/domain/menu.rules";
import type { Locale } from "@/shared/i18n/config";
import { localize } from "@/shared/i18n/localized";
import { MenuItemCard } from "@/features/menu/ui/components/MenuItemCard";

/**
 * Public menu board: groups items by category for display.
 *
 * Server Component — takes an already-fetched {@link Menu} (fetching is the
 * route/use-case's job). `emptyLabel` is passed in so this stays i18n-agnostic.
 */
export function MenuBoard({
  menu,
  locale,
  emptyLabel,
}: {
  menu: Menu | null;
  locale: Locale;
  emptyLabel: string;
}) {
  if (!menu || menu.items.length === 0) {
    return <p className="text-[rgb(var(--color-muted))]">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      {visibleCategories(menu).map((category) => (
        <section key={category.id} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{localize(category.name, locale)}</h2>
          <div className="grid gap-3">
            {itemsInCategory(menu, category.id).map((item) => (
              <MenuItemCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
