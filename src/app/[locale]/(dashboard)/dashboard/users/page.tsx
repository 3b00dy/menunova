import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { PageHeader } from "@/shared/ui";
import { getSession, hasRole } from "@/features/auth";
import { listRestaurants } from "@/features/restaurant";
import { listUsers, UsersManager } from "@/features/users";

/** Super-admin: list & manage every user account on the platform. */
export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };

  const session = await getSession();
  if (!session || !hasRole(session.user, "super_admin")) {
    redirect(routes.dashboard(locale));
  }

  const t = await getDictionary(locale);
  // Restaurants power the tenant picker/labels when a user is an owner/staff.
  const [users, restaurants] = await Promise.all([listUsers(), listRestaurants()]);

  return (
    <section className="flex flex-col gap-2">
      <PageHeader title={t.dashboard.usersAdmin.title} description={t.dashboard.usersAdmin.subtitle} />
      <UsersManager
        users={users}
        restaurants={restaurants.map((r) => ({ id: r.id, slug: r.slug, name: r.name }))}
        locale={locale}
      />
    </section>
  );
}
