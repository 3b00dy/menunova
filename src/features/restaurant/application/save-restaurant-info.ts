"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { normalizeRestaurantInfo, type RestaurantInfo } from "@/shared/theme/restaurant-info";
import { requirePermission } from "@/features/auth";
import { restaurantThemeRepository } from "@/features/restaurant/infrastructure/restaurant-theme.repository";
import { getRestaurantTheme } from "@/features/restaurant/application/get-restaurant-theme";

/**
 * Save a restaurant's public info (address, hours, phone, socials). Gated by
 * `settings:manage` (owner / super admin) — re-checked here since Server Actions
 * are independently reachable.
 *
 * Info lives in the theme settings JSON until the backend adds profile fields,
 * so this merges into the STORED theme (keeping the design untouched) and
 * normalizes the input (never trust the client's shape).
 */
export async function saveRestaurantInfo(input: {
  locale: string;
  slug: string;
  info: RestaurantInfo;
}): Promise<void> {
  const { token } = await requirePermission("settings:manage");
  const stored = await getRestaurantTheme(input.slug);
  await restaurantThemeRepository.save(
    input.slug,
    { ...stored, info: normalizeRestaurantInfo(input.info) },
    token,
  );
  revalidateTag(`theme:${input.slug}`, "max");
  revalidatePath(`/${input.locale}/r/${input.slug}`);
  revalidatePath(`/${input.locale}/dashboard/restaurant`);
}
