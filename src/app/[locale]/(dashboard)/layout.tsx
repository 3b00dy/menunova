import type { Locale } from "@/shared/i18n/config";
import { getSession, hasRole } from "@/features/auth";
import { getRestaurantSettings } from "@/features/restaurant";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/app/[locale]/(dashboard)/_components/DashboardNav";

const RESTAURANT_SLUG = "demo"; // TODO: derive from the authenticated user's restaurant

/**
 * Authenticated owner/staff shell (sidebar + content).
 *
 * Gating note: the `proxy` redirects unauthenticated users away from
 * `/dashboard`, but Server Actions bypass path gating — always re-check
 * authorization inside actions/pages via `@/features/auth` `requireRole`.
 * The `getServerSession` read here is the coarse layout-level guard.
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
  // Resolve the session: role drives the nav (super-admin sees All Restaurants).
  const session = await getSession();
  const isSuperAdmin = !!session && hasRole(session.user, "super_admin");
  // Restaurant's supported languages drive the sidebar language switcher.
  const settings = await getRestaurantSettings(RESTAURANT_SLUG);

  return (
    <div className="flex flex-1">
      <DashboardSidebar
        supportedLanguages={settings.supportedLanguages}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardMobileNav isSuperAdmin={isSuperAdmin} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
