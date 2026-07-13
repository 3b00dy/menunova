import { hasRole, type Role, type Session } from "@/features/auth/domain/session.entity";
import { getSession } from "@/features/auth/application/getSession";

/**
 * SKELETON gate: ensure the current session meets a minimum role, else throw.
 * Call from Server Components/Actions in the dashboard. Never rely on the proxy
 * alone for authorization (Server Actions bypass path-based gating).
 */
export async function requireRole(required: Role): Promise<Session> {
  const session = await getSession();
  if (!session || !hasRole(session.user, required)) {
    throw new Error("Forbidden");
  }
  return session;
}
