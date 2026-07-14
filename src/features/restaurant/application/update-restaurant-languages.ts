"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/shared/config/env";
import { getServerSession } from "@/shared/auth/getServerSession";
import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import { restaurantSettingsMockRepository } from "@/features/restaurant/infrastructure/restaurant-settings.mock";

/**
 * Update which languages a restaurant supports. Server Action — authorization is
 * enforced here (required in live mode; the demo/mock runs without a login yet).
 * Revalidates the dashboard so the sidebar switcher and menu editor pick up the
 * new language set.
 */
export async function updateRestaurantLanguages(input: {
  slug: string;
  locale: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}): Promise<RestaurantSettings> {
  if (env.dataMode !== "mock" && !(await getServerSession())) {
    throw new Error("Unauthorized");
  }

  const settings = await restaurantSettingsMockRepository.updateLanguages(input.slug, {
    defaultLanguage: input.defaultLanguage,
    supportedLanguages: input.supportedLanguages,
  });

  revalidatePath(`/${input.locale}/dashboard`, "layout");
  return settings;
}
