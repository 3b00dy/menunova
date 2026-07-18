import { env } from "@/shared/config/env";
import { SESSION_COOKIE, isDemoToken } from "@/shared/auth/session-cookie";

/**
 * Whether the CURRENT request should read/write the in-memory mock data instead
 * of the live backend API. True when:
 *   - the app runs in mock mode (`MENUNOVA_DATA_MODE` unset — local dev), or
 *   - the request belongs to a demo session (public "try it" login).
 * Otherwise false → the live API. This is what lets the demo and live
 * experiences coexist in the same deployment, decided per session.
 *
 * `next/headers` is imported dynamically (not at module top-level) on purpose:
 * this module is reachable from client components via feature barrels, and a
 * static `next/headers` import would poison the client bundle. The dynamic
 * import only ever runs on the server, where repositories are actually called.
 */
export async function useMockData(): Promise<boolean> {
  if (env.dataMode === "mock") return true;
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && isDemoToken(token);
}

/**
 * Build a repository that forwards every (async) method call to the mock or the
 * live implementation, chosen per request by {@link useMockData}. Both must
 * implement the same port `T`, so use-cases and pages stay unaware of the split:
 * a demo session transparently gets the seeded tenant, a live session gets the
 * API. Every port method here returns a Promise, so returning the delegate's
 * Promise directly preserves the contract.
 */
export function requestRoutedRepository<T extends object>(mock: T, live: T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      return async (...args: unknown[]) => {
        const impl = (await useMockData()) ? mock : live;
        const method = (impl as Record<PropertyKey, unknown>)[prop] as (
          ...a: unknown[]
        ) => unknown;
        return method.apply(impl, args);
      };
    },
  });
}
