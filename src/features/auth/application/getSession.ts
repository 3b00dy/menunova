import { cookies } from "next/headers";
import type { AuthUser, Role, Session } from "@/features/auth/domain/session.entity";
import { getServerSession } from "@/shared/auth/getServerSession";
import { env } from "@/shared/config/env";
import { authRepository } from "@/features/auth/infrastructure/auth.repository";

/**
 * Cookie that selects which demo role the mock session assumes. Set by the
 * dev-only role switcher (see `setDemoRole`) so every role's flow — super admin,
 * restaurant admin (owner), restaurant staff — is walkable without a real login.
 * Ignored entirely in `live` mode.
 */
export const DEMO_ROLE_COOKIE = "mn_role";

/** The restaurant the demo owner/staff belong to (matches the seeded tenant). */
const DEMO_RESTAURANT_ID = "demo";

/** Mock users for each demo role. */
const DEMO_USERS: Record<"super_admin" | "owner" | "staff", AuthUser> = {
  super_admin: { id: "u_super", email: "admin@menunova.app", role: "super_admin" },
  owner: {
    id: "u_owner",
    email: "owner@pizzapalace.test",
    role: "owner",
    restaurantId: DEMO_RESTAURANT_ID,
  },
  staff: {
    id: "u_staff",
    email: "staff@pizzapalace.test",
    role: "staff",
    restaurantId: DEMO_RESTAURANT_ID,
  },
};

/** Default demo role — the restaurant admin, since that's the primary flow. */
const DEFAULT_DEMO_ROLE: "super_admin" | "owner" | "staff" = "owner";

function isDemoRole(value: string | undefined): value is "super_admin" | "owner" | "staff" {
  return value === "super_admin" || value === "owner" || value === "staff";
}

function demoSession(role: "super_admin" | "owner" | "staff"): Session {
  return { user: DEMO_USERS[role], token: `mock-${role}` };
}

/**
 * Resolve the full authenticated session (user + role).
 *
 * Resolution order:
 *  1. A real `mn_session` cookie that {@link authRepository} can verify wins —
 *     this is a genuinely logged-in user (works in both mock and live mode).
 *  2. Otherwise, in mock mode, fall back to a demo session for the role selected
 *     by the `mn_role` cookie (default: restaurant admin), so the dashboard and
 *     dev role switcher stay browsable without logging in.
 *  3. Otherwise (live, no valid token): unauthenticated.
 */
export async function getSession(): Promise<Session | null> {
  const raw = await getServerSession();
  if (raw) {
    const session = await authRepository.verify(raw.token);
    if (session) return session;
  }
  if (env.dataMode === "mock") {
    const store = await cookies();
    const selected = store.get(DEMO_ROLE_COOKIE)?.value;
    return demoSession(isDemoRole(selected) ? selected : DEFAULT_DEMO_ROLE);
  }
  return null;
}

/** The roles the demo switcher can assume, most-privileged first. */
export const DEMO_ROLES: readonly Role[] = ["super_admin", "owner", "staff"];
