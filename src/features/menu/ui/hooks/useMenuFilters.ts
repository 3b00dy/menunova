"use client";

import { useMemo, useState } from "react";
import type { Menu, MenuItem } from "@/features/menu/domain/menu.entity";

/**
 * Client-side filtering state for the dashboard menu editor (search + category).
 * Pure UI concern — lives in the feature's `ui` layer.
 */
export function useMenuFilters(menu: Menu | null) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const items: MenuItem[] = useMemo(() => {
    if (!menu) return [];
    const q = query.toLowerCase();
    return menu.items.filter((item) => {
      // Match against the name in any language the item is authored in.
      const matchesQuery = Object.values(item.name).join(" ").toLowerCase().includes(q);
      const matchesCategory = categoryId ? item.categoryId === categoryId : true;
      return matchesQuery && matchesCategory;
    });
  }, [menu, query, categoryId]);

  return { query, setQuery, categoryId, setCategoryId, items };
}
