import type { Locale } from "@/shared/i18n/config";
import { getServerSession } from "@/shared/auth/getServerSession";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/app/[locale]/(dashboard)/_components/DashboardNav";

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
  // Coarse guard; real redirect happens in proxy. Kept for defense-in-depth.
  await getServerSession();

  return (
    <div className="flex flex-1">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardMobileNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
