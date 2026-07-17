"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { setDemoRole } from "@/features/auth/application/setDemoRole";

/** Roles the demo switcher offers, most-privileged first (mirrors DEMO_ROLES). */
const DEMO_ROLES = ["super_admin", "owner", "staff"] as const;

/**
 * Dev-only role switcher shown in the dashboard sidebar (mock mode only). Lets
 * you preview the app as a super admin, restaurant admin (owner), or restaurant
 * staff so every role's flow and permission set is walkable without real auth.
 * Imports the Server Action directly (not the auth barrel) to keep server-only
 * modules — `next/headers` — out of the client bundle.
 */
export function RoleSwitcher({ role }: { role: string }) {
  const { locale, dictionary: t } = useI18n();
  const rs = t.dashboard.roleSwitcher;
  const roles = t.dashboard.roles as Record<string, string>;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--color-muted))]">
        <ShieldCheck className="h-3.5 w-3.5" />
        {rs.label}
      </span>
      <select
        value={role}
        disabled={pending}
        aria-label={rs.label}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            await setDemoRole(next, locale);
            router.refresh();
          });
        }}
        className="h-9 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-2 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] disabled:opacity-60"
      >
        {DEMO_ROLES.map((r) => (
          <option key={r} value={r}>
            {roles[r] ?? r}
          </option>
        ))}
      </select>
    </label>
  );
}
