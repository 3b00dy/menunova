import type { Session } from "@/features/auth/domain/session.entity";
import { getServerSession } from "@/shared/auth/getServerSession";

/**
 * SKELETON use-case: resolve the full authenticated session (user + role).
 * TODO: implement `AuthHttpRepository.verify` and validate the token here.
 */
export async function getSession(): Promise<Session | null> {
  const raw = await getServerSession();
  if (!raw) return null;
  // Placeholder — real code verifies `raw.token` against the backend.
  return null;
}
