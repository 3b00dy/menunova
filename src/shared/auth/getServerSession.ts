import { cookies } from "next/headers";

/**
 * Thin, shared session-cookie accessor used by layouts, the proxy, and the auth
 * feature. It only reads/writes the opaque session token cookie; token
 * validation and role logic live behind `@/features/auth` (so `shared` keeps no
 * dependency on a feature).
 */

export const SESSION_COOKIE = "mn_session";

/** One year — the token itself carries expiry; this is just the cookie lifetime. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface ServerSession {
  token: string;
}

export async function getServerSession(): Promise<ServerSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? { token } : null;
}

/** Persist a session token (called after a successful login/registration). */
export async function setServerSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Clear the session cookie (called on logout). */
export async function clearServerSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
