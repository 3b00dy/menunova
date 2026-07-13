import type { Category, Menu, MenuItem } from "@/features/menu/domain/menu.entity";

/** Pure business rules over the menu domain. Easy to unit-test in isolation. */

/** Items belonging to a category, only the available ones, unsorted. */
export function itemsInCategory(menu: Menu, categoryId: string): MenuItem[] {
  return menu.items.filter((item) => item.categoryId === categoryId);
}

/** Categories sorted for display, dropping any that have no items. */
export function visibleCategories(menu: Menu): Category[] {
  return [...menu.categories]
    .filter((category) => menu.items.some((i) => i.categoryId === category.id))
    .sort((a, b) => a.position - b.position);
}

export function isMenuEmpty(menu: Menu): boolean {
  return menu.items.length === 0;
}
