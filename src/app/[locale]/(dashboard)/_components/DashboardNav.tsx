"use client";

import {
  LayoutDashboard,
  UtensilsCrossed,
  Palette,
  Store,
  Users,
  UserCog,
  CreditCard,
  Building2,
} from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { Sidebar, MobileNav, BrandLogo, LanguagePicker, type NavItem } from "@/shared/ui";
import { RoleSwitcher } from "@/features/auth/ui/RoleSwitcher";
import { LogoutButton } from "@/features/auth/ui/LogoutButton";

/**
 * Which dashboard capabilities the current user has. A serializable projection
 * of the permission model (resolved in the server layout via `can`), so the
 * client nav shows exactly the sections the role may reach — nothing more.
 */
export interface DashboardCaps {
  /** View the menu (and, for staff, toggle availability). */
  menu: boolean;
  /** Customize the public theme. */
  theme: boolean;
  /** Restaurant settings (languages, billing). */
  settings: boolean;
  /** Manage the restaurant's staff. */
  staff: boolean;
  /** Platform-wide: all restaurants (super admin). */
  restaurants: boolean;
  /** Platform-wide: all user accounts (super admin). */
  users: boolean;
}

/**
 * Client nav for the dashboard. Icons (lucide components) can't be passed from
 * the server layout across the RSC boundary, so the item list is built here.
 * Labels/locale come from the i18n context; `caps` (serializable, resolved in
 * the server layout) gates every entry to the current role's permissions.
 */
function useNavItems(caps: DashboardCaps): NavItem[] {
  const { locale, dictionary: t } = useI18n();
  const items: NavItem[] = [
    { href: routes.dashboard(locale), label: t.dashboard.title, icon: LayoutDashboard, end: true },
  ];
  if (caps.restaurants) {
    items.push({
      href: routes.dashboardRestaurants(locale),
      label: t.dashboard.allRestaurants,
      icon: Building2,
    });
  }
  if (caps.users) {
    items.push({
      href: routes.dashboardUsers(locale),
      label: t.dashboard.allUsers,
      icon: UserCog,
    });
  }
  if (caps.menu) {
    items.push({ href: routes.dashboardMenu(locale), label: t.dashboard.menu, icon: UtensilsCrossed });
  }
  if (caps.theme) {
    items.push({ href: routes.dashboardTheme(locale), label: t.dashboard.themeBuilder, icon: Palette });
  }
  if (caps.settings) {
    items.push({ href: routes.dashboardRestaurant(locale), label: t.dashboard.restaurant, icon: Store });
  }
  if (caps.staff) {
    items.push({ href: routes.dashboardStaff(locale), label: t.dashboard.staff, icon: Users });
  }
  if (caps.settings) {
    items.push({ href: routes.dashboardBilling(locale), label: t.dashboard.billing, icon: CreditCard });
  }
  return items;
}

/**
 * Sidebar with a language switcher (restricted to the restaurant's supported
 * languages) and — in demo/mock mode — a dev role switcher at the bottom.
 * `LanguagePicker` renders nothing when only one language is supported.
 */
export function DashboardSidebar({
  supportedLanguages,
  caps,
  role,
  showRoleSwitcher,
}: {
  supportedLanguages: string[];
  caps: DashboardCaps;
  role: string;
  showRoleSwitcher: boolean;
}) {
  return (
    <Sidebar
      brand={<BrandLogo />}
      items={useNavItems(caps)}
      footer={
        <div className="flex flex-col gap-3">
          <LanguagePicker supportedCodes={supportedLanguages} className="w-full justify-between" />
          {showRoleSwitcher && <RoleSwitcher role={role} />}
          <LogoutButton />
        </div>
      }
    />
  );
}

export function DashboardMobileNav({ caps }: { caps: DashboardCaps }) {
  return <MobileNav items={useNavItems(caps)} />;
}
