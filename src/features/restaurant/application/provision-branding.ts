import { restaurantRepository } from "@/features/restaurant/infrastructure/restaurant.repository";

/**
 * Signup-time branding write (logo + brand colour from the onboarding wizard),
 * which `POST /auth/register` doesn't accept. Like `provisionRestaurantLanguages`
 * it has no permission gate — it runs before the session cookie exists — and the
 * new owner's own `token` authorizes the PATCH (the backend only lets an owner
 * edit their own restaurant). Only the sent fields change; plan/status are kept.
 */
export async function provisionRestaurantBranding(
  slug: string,
  branding: { logoUrl?: string; brandColor?: string },
  token: string,
): Promise<void> {
  if (!branding.logoUrl && !branding.brandColor) return;
  const restaurant = await restaurantRepository.getBySlug(slug);
  if (!restaurant) return;
  await restaurantRepository.update(restaurant.id, branding, token);
}
