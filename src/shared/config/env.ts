/**
 * Typed, centralized environment access.
 *
 * Only `NEXT_PUBLIC_`-prefixed vars are available on the client (Next.js 16).
 * Keep server-only secrets out of anything imported by client components.
 *
 * Later: swap the manual reads for zod validation (see plan's optional follow-ups).
 */

function required(name: string, value: string | undefined, fallback?: string): string {
  const resolved = value ?? fallback;
  if (resolved === undefined || resolved === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return resolved;
}

export const env = {
  /** Base URL of the separate backend API service. */
  apiUrl: required(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
    "https://menunovaapi.onrender.com",
  ),
  isProduction: process.env.NODE_ENV === "production",
  /**
   * Where feature data comes from. `"mock"` (default) uses in-memory
   * repositories so the app is fully usable without the backend (demos, local
   * dev). Set `MENUNOVA_DATA_MODE=live` to talk to the real API.
   */
  dataMode: process.env.MENUNOVA_DATA_MODE === "live" ? "live" : "mock",
} as const;

export type Env = typeof env;
