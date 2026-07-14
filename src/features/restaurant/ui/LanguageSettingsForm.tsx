"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { Button, Card, CardBody, Field, SupportedLanguagesField } from "@/shared/ui";
import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import { updateRestaurantLanguages } from "@/features/restaurant/application/update-restaurant-languages";

/** Admin control for the restaurant's supported/default menu languages. */
export function LanguageSettingsForm({
  settings,
  slug,
}: {
  settings: RestaurantSettings;
  slug: string;
}) {
  const { locale, dictionary: t } = useI18n();
  const s = t.dashboard.languageSettings;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [supported, setSupported] = useState<string[]>(settings.supportedLanguages);
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateRestaurantLanguages({
        slug,
        locale,
        defaultLanguage,
        supportedLanguages: supported,
      });
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-5">
        <SupportedLanguagesField
          label={s.supported}
          value={supported}
          primary={defaultLanguage}
          onChange={(next) => {
            setSaved(false);
            setSupported(next);
          }}
        />

        <Field label={s.default} hint={s.defaultHint}>
          <select
            value={defaultLanguage}
            onChange={(e) => {
              setSaved(false);
              setDefaultLanguage(e.target.value);
            }}
            className="h-10 w-full max-w-xs rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
          >
            {supported.map((code) => (
              <option key={code} value={code}>
                {SUPPORTED_LANGUAGES[code]?.name ?? code}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={pending}>
            {s.save}
          </Button>
          {saved && !pending && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              {s.saved}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
