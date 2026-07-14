"use client";

import {
  LayoutDashboard,
  UtensilsCrossed,
  Palette,
  Store,
  Users,
  CreditCard,
  Building2,
} from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { Sidebar, MobileNav, BrandLogo, LanguagePicker, type NavItem } from "@/shared/ui";

/**
 * Client nav for the dashboard. Icons (lucide components) can't be passed from
 * the server layout across the RSC boundary, so the item list is built here.
 * Labels/locale come from the i18n context; `isSuperAdmin` (a serializable flag
 * resolved in the server layout) gates the cross-tenant "All Restaurants" entry.
 */
function useNavItems(isSuperAdmin: boolean): NavItem[] {
  const { locale, dictionary: t } = useI18n();
  const items: NavItem[] = [
    { href: routes.dashboard(locale), label: t.dashboard.title, icon: LayoutDashboard, end: true },
  ];
  if (isSuperAdmin) {
    items.push({
      href: routes.dashboardRestaurants(locale),
      label: t.dashboard.allRestaurants,
      icon: Building2,
    });
  }
  items.push(
    { href: routes.dashboardMenu(locale), label: t.dashboard.menu, icon: UtensilsCrossed },
    { href: routes.dashboardTheme(locale), label: t.dashboard.themeBuilder, icon: Palette },
    { href: routes.dashboardRestaurant(locale), label: t.dashboard.restaurant, icon: Store },
    { href: routes.dashboardStaff(locale), label: t.dashboard.staff, icon: Users },
    { href: routes.dashboardBilling(locale), label: t.dashboard.billing, icon: CreditCard },
  );
  return items;
}

/**
 * Sidebar with a language switcher (restricted to the restaurant's supported
 * languages) at the bottom. `LanguagePicker` renders nothing when only one
 * language is supported.
 */
export function DashboardSidebar({
  supportedLanguages,
  isSuperAdmin,
}: {
  supportedLanguages: string[];
  isSuperAdmin: boolean;
}) {
  return (
    <Sidebar
      brand={<BrandLogo />}
      items={useNavItems(isSuperAdmin)}
      footer={<LanguagePicker supportedCodes={supportedLanguages} className="w-full justify-between" />}
    />
  );
}

export function DashboardMobileNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return <MobileNav items={useNavItems(isSuperAdmin)} />;
}
