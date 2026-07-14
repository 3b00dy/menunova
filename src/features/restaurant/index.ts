/** Public API of the `restaurant` feature. Import only from here. */
export type { Restaurant } from "@/features/restaurant/domain/restaurant.entity";
export { getRestaurantBySlug } from "@/features/restaurant/application/get-restaurant-by-slug";

// Settings (languages)
export type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
export { getRestaurantSettings } from "@/features/restaurant/application/get-restaurant-settings";
export { updateRestaurantLanguages } from "@/features/restaurant/application/update-restaurant-languages";
export { LanguageSettingsForm } from "@/features/restaurant/ui/LanguageSettingsForm";
