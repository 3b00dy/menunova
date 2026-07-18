import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import { restaurantSettingsRepository } from "@/features/restaurant/infrastructure/restaurant-settings.repository";

/**
 * System-level language-settings write used by self-serve signup, run while the
 * new owner is being provisioned. Unlike `updateRestaurantLanguages`, it carries
 * NO permission gate (the session cookie isn't set yet during registration).
 * The `token` — the freshly minted owner session — authorizes the live PUT.
 */
export async function provisionRestaurantLanguages(
  slug: string,
  input: { defaultLanguage: string; supportedLanguages: string[] },
  token: string,
): Promise<RestaurantSettings> {
  return restaurantSettingsRepository.updateLanguages(slug, input, token);
}
