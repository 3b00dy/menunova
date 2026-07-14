"use client";

import {
  LayoutDashboard,
  UtensilsCrossed,
  Palette,
  Store,
  Users,
  CreditCard,
} from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { Sidebar, MobileNav, BrandLogo, LanguagePicker, type NavItem } from "@/shared/ui";

/**
 * Client nav for the dashboard. Icons (lucide components) can't be passed from
 * the server layout across the RSC boundary, so the item list is built here.
 * Labels/locale come from the i18n context provided by AppProviders.
 */
function useNavItems(): NavItem[] {
  const { locale, dictionary: t } = useI18n();
  return [
    { href: routes.dashboard(locale), label: t.dashboard.title, icon: LayoutDashboard, end: true },
    { href: routes.dashboardMenu(locale), label: t.dashboard.menu, icon: UtensilsCrossed },
    { href: routes.dashboardTheme(locale), label: t.dashboard.themeBuilder, icon: Palette },
    { href: routes.dashboardRestaurant(locale), label: t.dashboard.restaurant, icon: Store },
    { href: routes.dashboardStaff(locale), label: t.dashboard.staff, icon: Users },
    { href: routes.dashboardBilling(locale), label: t.dashboard.billing, icon: CreditCard },
  ];
}

/**
 * Language switcher at the bottom of the sidebar, restricted to the languages
 * the restaurant supports (from its settings). `LanguagePicker` renders nothing
 * when only one language is supported.
 */
export function DashboardSidebar({ supportedLanguages }: { supportedLanguages: string[] }) {
  return (
    <Sidebar
      brand={<BrandLogo />}
      items={useNavItems()}
      footer={<LanguagePicker supportedCodes={supportedLanguages} className="w-full justify-between" />}
    />
  );
}

export function DashboardMobileNav() {
  return <MobileNav items={useNavItems()} />;
}
