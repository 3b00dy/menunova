import { cookies } from "next/headers";

/**
 * Thin, shared session accessor used by layouts and route composition to gate
 * access. Reads the session token cookie (async in Next.js 16) and would
 * validate it against the backend via the `auth` feature.
 *
 * This is a STUB: it only reads the cookie's presence so the structure runs.
 * The real implementation lives behind `@/features/auth` (session validation,
 * roles); this shared helper stays intentionally minimal to avoid a dependency
 * from `shared` into a feature.
 */

export const SESSION_COOKIE = "mn_session";

export interface ServerSession {
  token: string;
}

export async function getServerSession(): Promise<ServerSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? { token } : null;
}
