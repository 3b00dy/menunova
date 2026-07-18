import type { Locale } from "@/shared/i18n/config";
import { getRestaurantSettings } from "@/features/restaurant";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/app/[locale]/(dashboard)/_components/DashboardNav";
import { getDashboardAccess } from "@/app/[locale]/(dashboard)/_lib/access";

/**
 * Authenticated owner/staff shell (sidebar + content).
 *
 * Gating note: the `proxy` redirects unauthenticated users away from
 * `/dashboard`, but Server Actions bypass path gating — always re-check
 * authorization inside actions/pages via `@/features/auth` (`requirePermission`).
 * The capabilities resolved here only drive which nav entries are visible; they
 * are NOT the security boundary.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Narrow for parity with other routes; direction/labels come via i18n context.
  void ((await params) as { locale: Locale });
  // Role drives the nav; the user's restaurant supplies the switcher languages.
  const { caps, role, restaurantId, showRoleSwitcher } = await getDashboardAccess();
  // Super admin has no single restaurant — fall back to the demo tenant's langs.
  const settings = await getRestaurantSettings(restaurantId ?? "demo");

  return (
    <div className="flex flex-1">
      <DashboardSidebar
        supportedLanguages={settings.supportedLanguages}
        caps={caps}
        role={role ?? "owner"}
        showRoleSwitcher={showRoleSwitcher}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardMobileNav caps={caps} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
