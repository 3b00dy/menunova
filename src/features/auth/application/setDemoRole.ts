"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { env } from "@/shared/config/env";
import { DEMO_ROLE_COOKIE } from "@/features/auth/application/getSession";

/**
 * Dev-only Server Action: switch which role the mock session assumes, so the
 * restaurant-admin and staff flows can be walked without a real login. No-op in
 * `live` mode (real auth owns the session there). Revalidates the dashboard
 * layout so the nav, gates, and menu controls re-render for the new role.
 */
export async function setDemoRole(role: string, locale: string): Promise<void> {
  if (env.dataMode !== "mock") return;
  const store = await cookies();
  store.set(DEMO_ROLE_COOKIE, role, { path: "/", sameSite: "lax" });
  revalidatePath(`/${locale}/dashboard`, "layout");
}
