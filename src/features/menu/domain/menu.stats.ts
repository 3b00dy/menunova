import type { LocalizedText } from "@/shared/i18n/localized";
import type { Menu } from "@/features/menu/domain/menu.entity";

/**
 * Derived, at-a-glance insights over a {@link Menu}. Pure — no React/fetch — so
 * it's trivially testable and reusable by the dashboard overview. Everything is
 * computed from menu content the restaurant already authored (no orders/traffic
 * data exists in this menu SaaS).
 */
export interface CategoryCount {
  id: string;
  name: LocalizedText;
  count: number;
}

export interface PriceStats {
  currency: string;
  averageMinor: number;
  minMinor: number;
  maxMinor: number;
}

export interface CoverageStats {
  /** % of items whose name is filled in EVERY supported language. */
  overallPct: number;
  /** % of items whose name is filled per supported language. */
  perLanguage: { locale: string; pct: number }[];
}

export interface MenuStats {
  categoryCount: number;
  itemCount: number;
  availableCount: number;
  unavailableCount: number;
  /** 0–100, rounded. */
  availablePct: number;
  /** Every category (incl. empty ones) with its item count, sorted by position. */
  itemsPerCategory: CategoryCount[];
  /** Null when the menu has no items. */
  price: PriceStats | null;
  coverage: CoverageStats;
}

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

export function computeMenuStats(
  menu: Menu | null,
  supportedLanguages: string[],
): MenuStats {
  const categories = menu?.categories ?? [];
  const items = menu?.items ?? [];
  const itemCount = items.length;
  const availableCount = items.filter((i) => i.available).length;

  const itemsPerCategory: CategoryCount[] = [...categories]
    .sort((a, b) => a.position - b.position)
    .map((c) => ({
      id: c.id,
      name: c.name,
      count: items.filter((i) => i.categoryId === c.id).length,
    }));

  let price: PriceStats | null = null;
  if (itemCount > 0) {
    const amounts = items.map((i) => i.price.amountMinor);
    const total = amounts.reduce((s, a) => s + a, 0);
    price = {
      currency: items[0].price.currency,
      averageMinor: Math.round(total / itemCount),
      minMinor: Math.min(...amounts),
      maxMinor: Math.max(...amounts),
    };
  }

  const perLanguage = supportedLanguages.map((locale) => ({
    locale,
    pct: pct(items.filter((i) => i.name[locale]?.trim()).length, itemCount),
  }));
  const overallPct = pct(
    items.filter((i) => supportedLanguages.every((l) => i.name[l]?.trim())).length,
    itemCount,
  );

  return {
    categoryCount: categories.length,
    itemCount,
    availableCount,
    unavailableCount: itemCount - availableCount,
    availablePct: pct(availableCount, itemCount),
    itemsPerCategory,
    price,
    coverage: { overallPct, perLanguage },
  };
}
