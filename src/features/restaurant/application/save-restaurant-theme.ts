"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { ThemeConfig } from "@/shared/theme/tenant-config";
import { requirePermission } from "@/features/auth";
import { restaurantThemeRepository } from "@/features/restaurant/infrastructure/restaurant-theme.repository";

/**
 * Persist a restaurant's public-menu theme. Gated by `theme:manage` (owner or
 * super admin) — re-checked here since Server Actions are independently
 * reachable. Revalidates the public menu so the new design shows immediately.
 */
export async function saveRestaurantTheme(input: {
  locale: string;
  slug: string;
  theme: ThemeConfig;
}): Promise<void> {
  const { token } = await requirePermission("theme:manage");
  await restaurantThemeRepository.save(input.slug, input.theme, token);
  revalidateTag(`theme:${input.slug}`, "max");
  revalidatePath(`/${input.locale}/r/${input.slug}`);
}
