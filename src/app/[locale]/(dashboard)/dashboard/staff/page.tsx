import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { PageHeader } from "@/shared/ui";
import { can, getSession } from "@/features/auth";
import { listStaff, StaffManager } from "@/features/staff";

/**
 * Staff management — restaurant-admin only (`staff:manage`). Invite team
 * members and set each one's role (admin vs availability-only staff).
 * Authorization is enforced here (redirect) and again inside every Server
 * Action; the nav simply hides this entry for roles that lack the capability.
 */
export default async function StaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const session = await getSession();
  if (!session || !can(session.user, "staff:manage")) {
    redirect(routes.dashboard(locale));
  }

  const t = await getDictionary(locale);
  const s = t.dashboard.staffManager;
  const restaurantId = session.user.restaurantId ?? "demo";
  const staff = await listStaff(restaurantId);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={s.title} description={s.subtitle} />
      <StaffManager staff={staff} restaurantId={restaurantId} />
    </section>
  );
}
