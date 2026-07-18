/**
 * Session-cookie constants and pure helpers.
 *
 * Deliberately free of `next/headers` (unlike its sibling `getServerSession`) so
 * it's safe to import from modules that end up in the client bundle — e.g. the
 * request-routed repositories, which are reachable from client components
 * through feature barrels. Anything needing the actual cookie store stays in
 * `getServerSession`.
 */

export const SESSION_COOKIE = "mn_session";

/**
 * Demo session tokens are opaque and prefixed `demo-` (see the auth feature's
 * demo accounts), so the session resolver and repositories can recognize a demo
 * session without a backend round-trip. Real backend JWTs and BFF-signed tokens
 * never start with this prefix.
 */
export function isDemoToken(token: string): boolean {
  return token.startsWith("demo-");
}
