"use server";

import { redirect } from "next/navigation";
import { setServerSession } from "@/shared/auth/getServerSession";
import { routes } from "@/shared/config/routes";
import type { Locale } from "@/shared/i18n/config";
import type { Session } from "@/features/auth/domain/session.entity";
import { authRepository } from "@/features/auth/infrastructure/auth.repository";

/**
 * Log in with email + password. Returns an error code on failure (client maps
 * it to a localized message); on success sets the session cookie, redirects to
 * the dashboard, and never returns.
 */
export async function login(input: {
  locale: Locale;
  email: string;
  password: string;
}): Promise<{ error: string } | void> {
  if (!input.email.trim() || !input.password) {
    return { error: "required" };
  }

  let session: Session;
  try {
    session = await authRepository.login(input.email.trim(), input.password);
  } catch {
    return { error: "invalid_credentials" };
  }

  await setServerSession(session.token);
  redirect(routes.dashboard(input.locale));
}
