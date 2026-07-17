import { getSession } from "@/features/auth/application/getSession";
import { can, type Permission } from "@/features/auth/domain/permissions";
import type { Session } from "@/features/auth/domain/session.entity";

/**
 * Authorization gate for Server Components / Server Actions: ensure the current
 * session holds a {@link Permission}, else throw. Server Actions are
 * independently reachable endpoints, so authorization is enforced HERE — never
 * assume the proxy or the client UI gated the call. Returns the session so
 * callers can use `session.token` for the downstream API request.
 */
export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await getSession();
  if (!session || !can(session.user, permission)) {
    throw new Error("Forbidden");
  }
  return session;
}
