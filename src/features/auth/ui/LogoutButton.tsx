"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { logout } from "@/features/auth/application/logout";

/**
 * Log-out control for the dashboard sidebar. Calls the `logout` Server Action
 * (imported directly to avoid pulling server-only auth siblings into the client
 * bundle), which clears the session cookie and redirects to /login.
 */
export function LogoutButton() {
  const { locale, dictionary: t } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logout(locale))}
      className="inline-flex items-center gap-2 rounded-[var(--radius-active)] px-2 py-1.5 text-sm font-medium text-[rgb(var(--color-muted))] transition-colors hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text))] disabled:opacity-60"
    >
      <LogOut className="h-4 w-4 rtl:rotate-180" />
      {t.auth.logout}
    </button>
  );
}
