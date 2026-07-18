/** Public API of the `restaurant` feature. Import only from here. */
export type {
  Restaurant,
  RestaurantPlan,
  RestaurantStatus,
  RestaurantDraft,
  RestaurantPatch,
} from "@/features/restaurant/domain/restaurant.entity";
export { RESTAURANT_PLANS, RESTAURANT_STATUSES, statusTone } from "@/features/restaurant/domain/restaurant.entity";

// Platform insights (super admin)
export type { PlatformStats, PlanCount, StatusCount } from "@/features/restaurant/domain/restaurant.stats";
export { computePlatformStats } from "@/features/restaurant/domain/restaurant.stats";
export { getRestaurantBySlug } from "@/features/restaurant/application/get-restaurant-by-slug";
export { listRestaurants } from "@/features/restaurant/application/list-restaurants";
export {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "@/features/restaurant/application/restaurant-actions";
export { provisionRestaurant } from "@/features/restaurant/application/provision-restaurant";
export { provisionRestaurantLanguages } from "@/features/restaurant/application/provision-settings";
export { RestaurantsManager } from "@/features/restaurant/ui/RestaurantsManager";

// Settings (languages)
export type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
export { getRestaurantSettings } from "@/features/restaurant/application/get-restaurant-settings";
export { updateRestaurantLanguages } from "@/features/restaurant/application/update-restaurant-languages";
export { LanguageSettingsForm } from "@/features/restaurant/ui/LanguageSettingsForm";
