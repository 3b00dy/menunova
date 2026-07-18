"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { Button, Card, Field, Input } from "@/shared/ui";
import { login } from "@/features/auth/application/login";

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
      <p className="text-sm text-[rgb(var(--color-muted))]">
        {a.noAccount}{" "}
        <Link href={routes.register(locale)} className="font-medium text-[rgb(var(--color-primary))] hover:underline">
          {a.registerLink}
        </Link>
      </p>
    </Card>
  );
}
