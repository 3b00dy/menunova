"use server";

import { redirect } from "next/navigation";
import { setServerSession } from "@/shared/auth/getServerSession";
import { routes } from "@/shared/config/routes";
import type { Locale } from "@/shared/i18n/config";
import type { Session } from "@/features/auth/domain/session.entity";
import { matchDemoAccount } from "@/features/auth/domain/demo-accounts";
import { authRepository } from "@/features/auth/infrastructure/auth.repository";

/**
 * Log in with email + password. Returns an error code on failure (client maps
 * it to a localized message); on success sets the session cookie, redirects to
 * the dashboard, and never returns.
 *
 * Two paths:
 *  - **Demo** — the credentials match a demo account: NO backend call. A demo
 *    session is set and the dashboard renders the seeded "demo" tenant so public
 *    visitors can explore before subscribing (see `demo-accounts.ts`).
 *  - **Live** — any other credentials hit the real API (`/auth/login`) and land
 *    the user on their own real dashboard.
 */
export async function login(input: {
  locale: Locale;
  email: string;
  password: string;
}): Promise<{ error: string } | void> {
  if (!input.email.trim() || !input.password) {
    return { error: "required" };
  }

  // Demo accounts short-circuit — no API request.
  const demo = matchDemoAccount(input.email, input.password);
  if (demo) {
    await setServerSession(demo.token);
    redirect(routes.dashboard(input.locale));
  }

  // Live login — real backend.
  let session: Session;
  try {
    session = await authRepository.login(input.email.trim(), input.password);
  } catch {
    return { error: "invalid_credentials" };
  }

  await setServerSession(session.token);
  redirect(routes.dashboard(input.locale));
}
