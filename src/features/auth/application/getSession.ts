import type { Session } from "@/features/auth/domain/session.entity";
import { getServerSession } from "@/shared/auth/getServerSession";
import { env } from "@/shared/config/env";

/**
 * Mock super-admin session used in demo/dev (`MENUNOVA_DATA_MODE` not `live`),
 * so the dashboard is browsable and super-admin surfaces (e.g. All Restaurants)
 * are reachable before real auth is wired.
 */
const MOCK_SUPER_ADMIN: Session = {
  user: { id: "u_super", email: "admin@menunova.app", role: "super_admin" },
  token: "mock-super-admin",
};

/**
 * Resolve the full authenticated session (user + role).
 *
 * Live mode: verify the session token against the backend (TODO — returns null
 * until `AuthHttpRepository.verify` exists). Mock mode: hand back a super-admin
 * so the demo works without a login flow.
 */
export async function getSession(): Promise<Session | null> {
  const raw = await getServerSession();
  if (raw) {
    // TODO (live): verify `raw.token` against the backend and return the user.
  }
  if (env.dataMode === "mock") return MOCK_SUPER_ADMIN;
  return null;
}
