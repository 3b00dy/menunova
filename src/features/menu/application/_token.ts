import { env } from "@/shared/config/env";
import { getServerSession } from "@/shared/auth/getServerSession";

/**
 * Resolve the bearer token for a menu mutation.
 *
 * Server Actions are independently reachable POST endpoints, so authorization
 * MUST be checked here — never assume the proxy gated the call. In `live` mode a
 * valid session is required; in `mock` mode (demo/dev, no login wired yet) a
 * placeholder token is used so the flow is exercisable end-to-end.
 */
export async function requireMenuToken(): Promise<string> {
  const session = await getServerSession();
  if (session) return session.token;
  if (env.dataMode === "mock") return "mock-token";
  throw new Error("Unauthorized");
}
