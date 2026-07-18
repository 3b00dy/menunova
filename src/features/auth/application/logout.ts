"use server";

import { redirect } from "next/navigation";
import { clearServerSession, getServerSession, isDemoToken } from "@/shared/auth/getServerSession";
import { routes } from "@/shared/config/routes";
import type { Locale } from "@/shared/i18n/config";
import { authRepository } from "@/features/auth/infrastructure/auth.repository";

/**
 * Log out: best-effort revoke the token, clear the session cookie, and send the
 * user to the login page. (In mock mode the demo fallback session still exists,
 * so `/dashboard` remains browsable as the demo — the gate is enforced in live
 * mode; see `src/proxy.ts`.)
 */
export async function logout(locale: Locale): Promise<void> {
  const raw = await getServerSession();
  // Demo sessions have no backend token to revoke — just clear the cookie.
  if (raw && !isDemoToken(raw.token)) {
    try {
      await authRepository.logout(raw.token);
    } catch {
      // Best-effort; we clear the cookie regardless.
    }
  }
  await clearServerSession();
  redirect(routes.login(locale));
}
