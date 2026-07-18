"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserCog, ConciergeBell } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { Button, Card, Field, Input } from "@/shared/ui";
import { login } from "@/features/auth/application/login";
import { DEMO_ACCOUNTS } from "@/features/auth/domain/demo-accounts";

/** Map an action error code to a localized message. */
function errorMessage(errors: Record<string, string>, code: string): string {
  return errors[code === "invalid_credentials" ? "invalidCredentials" : code] ?? errors.invalidCredentials;
}

/**
 * Login form. Submits to the `login` Server Action (imported directly, not via
 * the auth barrel, to keep server-only siblings out of the client bundle). On
 * success the action redirects; on failure it returns an error code shown here.
 */
export function LoginForm() {
  const { locale, dictionary: t } = useI18n();
  const a = t.auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await login({ locale, email, password });
      if (res?.error) setError(errorMessage(a.errors, res.error));
    });
  }

  /** One-click demo sign-in (no API call — see the `login` action). */
  function signInDemo(demoEmail: string, demoPassword: string) {
    setError(null);
    setEmail(demoEmail);
    setPassword(demoPassword);
    startTransition(async () => {
      const res = await login({ locale, email: demoEmail, password: demoPassword });
      if (res?.error) setError(errorMessage(a.errors, res.error));
    });
  }

  const demoIcons = [UserCog, ConciergeBell] as const;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-[rgb(var(--color-text))]">{a.signIn}</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={a.email}>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label={a.password}>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error && (
          <p className="rounded-[var(--radius-active)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <Button type="submit" block disabled={pending}>
          {a.signInCta}
        </Button>
      </form>

      <div className="flex flex-col gap-3 rounded-[var(--radius-active)] border border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4">
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--color-text))]">{a.demoTitle}</p>
          <p className="text-xs text-[rgb(var(--color-muted))]">{a.demoSubtitle}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account, i) => {
            const Icon = demoIcons[i] ?? UserCog;
            const label = account.user.role === "owner" ? a.demoAdmin : a.demoStaff;
            return (
              <button
                key={account.token}
                type="button"
                disabled={pending}
                onClick={() => signInDemo(account.email, account.password)}
                className="flex items-center gap-2 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 py-2 text-start text-sm font-medium text-[rgb(var(--color-text))] transition-colors hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] disabled:opacity-60"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[rgb(var(--color-muted))]">{a.demoHint}</p>
      </div>

      <p className="text-sm text-[rgb(var(--color-muted))]">
        {a.noAccount}{" "}
        <Link href={routes.register(locale)} className="font-medium text-[rgb(var(--color-primary))] hover:underline">
          {a.registerLink}
        </Link>
      </p>
    </Card>
  );
}
