"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { ThemeConfig } from "@/shared/theme/tenant-config";
import { requirePermission } from "@/features/auth";
import { restaurantThemeRepository } from "@/features/restaurant/infrastructure/restaurant-theme.repository";
import { getRestaurantTheme } from "@/features/restaurant/application/get-restaurant-theme";

/**
 * Persist a restaurant's public-menu theme. Gated by `theme:manage` (owner or
 * super admin) — re-checked here since Server Actions are independently
 * reachable. Revalidates the public menu so the new design shows immediately.
 *
 * The Theme Builder doesn't edit restaurant `info`, so the STORED info is kept —
 * a stale builder tab can't wipe info saved from the settings page.
 */
export async function saveRestaurantTheme(input: {
  locale: string;
  slug: string;
  theme: ThemeConfig;
}): Promise<void> {
  const { token } = await requirePermission("theme:manage");
  const stored = await getRestaurantTheme(input.slug);
  await restaurantThemeRepository.save(input.slug, { ...input.theme, info: stored.info }, token);
  revalidateTag(`theme:${input.slug}`, "max");
  revalidatePath(`/${input.locale}/r/${input.slug}`);
}
