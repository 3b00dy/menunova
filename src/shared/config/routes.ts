import type { Locale } from "@/shared/i18n/config";

/**
 * Typed, locale-aware route builders. Import these instead of hardcoding paths
 * so the URL structure (locale prefix, tenant namespace) lives in one place.
 */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  pricing: (locale: Locale) => `/${locale}/pricing`,
  login: (locale: Locale) => `/${locale}/login`,
  register: (locale: Locale) => `/${locale}/register`,
  onboarding: (locale: Locale) => `/${locale}/onboarding`,
  checkout: (locale: Locale) => `/${locale}/onboarding/checkout`,

  dashboard: (locale: Locale) => `/${locale}/dashboard`,
  dashboardMenu: (locale: Locale) => `/${locale}/dashboard/menu`,
  dashboardTheme: (locale: Locale) => `/${locale}/dashboard/theme`,
  dashboardRestaurant: (locale: Locale) => `/${locale}/dashboard/restaurant`,
  dashboardStaff: (locale: Locale) => `/${locale}/dashboard/staff`,
  dashboardBilling: (locale: Locale) => `/${locale}/dashboard/billing`,
  /** Super-admin: manage all restaurants (tenants). */
  dashboardRestaurants: (locale: Locale) => `/${locale}/dashboard/restaurants`,

  /** Public, per-tenant customer menu. */
  publicMenu: (locale: Locale, restaurantSlug: string) =>
    `/${locale}/r/${restaurantSlug}`,
  publicMenuCategory: (locale: Locale, restaurantSlug: string, category: string) =>
    `/${locale}/r/${restaurantSlug}/${category}`,
} as const;
