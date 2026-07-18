"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth";
import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import { restaurantSettingsRepository } from "@/features/restaurant/infrastructure/restaurant-settings.repository";

/**
 * Update which languages a restaurant supports. Server Action — authorization is
 * enforced here: changing restaurant settings requires the `settings:manage`
 * capability (restaurant admin / super admin). Revalidates the dashboard so the
 * sidebar switcher and menu editor pick up the new language set.
 */
export async function updateRestaurantLanguages(input: {
  slug: string;
  locale: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}): Promise<RestaurantSettings> {
  const { token } = await requirePermission("settings:manage");

  const settings = await restaurantSettingsRepository.updateLanguages(
    input.slug,
    {
      defaultLanguage: input.defaultLanguage,
      supportedLanguages: input.supportedLanguages,
    },
    token,
  );

  revalidatePath(`/${input.locale}/dashboard`, "layout");
  return settings;
}
