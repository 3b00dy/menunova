"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { toLocalizedText } from "@/shared/i18n/localized";
import { Button, Card, CardBody, Field, Input, Switch } from "@/shared/ui";
import {
  DEFAULT_WEEK,
  type DayHours,
  type RestaurantInfo,
  type RestaurantSocials,
} from "@/shared/theme/restaurant-info";
import { saveRestaurantInfo } from "@/features/restaurant/application/save-restaurant-info";

const langName = (code: string) => SUPPORTED_LANGUAGES[code]?.name ?? code.toUpperCase();
const langDir = (code: string) => SUPPORTED_LANGUAGES[code]?.dir ?? "ltr";

/** Weekday indices (Date.getDay order) in the reader's week order. */
function weekOrder(locale: string): number[] {
  return locale === "ar" ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0];
}

const SOCIALS: (keyof RestaurantSocials)[] = ["instagram", "facebook", "tiktok", "website"];

/**
 * Restaurant info editor (BRD BR-BR-05/06/07): tagline and address in each
 * enabled language, phone, map link, weekly opening hours, social links. Shown
 * on the public menu. Saved via `saveRestaurantInfo`.
 */
export function RestaurantInfoForm({
  slug,
  info,
  languages,
  defaultLanguage,
}: {
  slug: string;
  info: RestaurantInfo;
  languages: string[];
  defaultLanguage: string;
}) {
  const { locale, dictionary: t } = useI18n();
  const r = t.dashboard.restaurantInfo;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const ordered = [defaultLanguage, ...languages.filter((l) => l !== defaultLanguage)];
  const [tagline, setTagline] = useState<Record<string, string>>(() =>
    Object.fromEntries(ordered.map((l) => [l, info.tagline[l] ?? ""])),
  );
  const [address, setAddress] = useState<Record<string, string>>(() =>
    Object.fromEntries(ordered.map((l) => [l, info.address[l] ?? ""])),
  );
  const [phone, setPhone] = useState(info.phone);
  const [mapUrl, setMapUrl] = useState(info.mapUrl);
  const [hours, setHours] = useState<DayHours[]>(info.hours.length === 7 ? info.hours : []);
  const [socials, setSocials] = useState<RestaurantSocials>(info.socials);

  const dayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "long" });
    // 25 Oct 2026 is a Sunday (getDay 0).
    return Array.from({ length: 7 }, (_, d) => fmt.format(new Date(2026, 9, 25 + d)));
  }, [locale]);
  const order = weekOrder(locale);

  const dirty = () => setSaved(false);
  const setDay = (day: number, patch: Partial<DayHours>) => {
    dirty();
    setHours((h) => h.map((x, i) => (i === day ? { ...x, ...patch } : x)));
  };

  function save() {
    setSaved(false);
    startTransition(async () => {
      await saveRestaurantInfo({
        locale,
        slug,
        info: {
          tagline: toLocalizedText(tagline),
          address: toLocalizedText(address),
          phone: phone.trim(),
          mapUrl: mapUrl.trim(),
          hours,
          socials: {
            instagram: socials.instagram.trim(),
            facebook: socials.facebook.trim(),
            tiktok: socials.tiktok.trim(),
            website: socials.website.trim(),
          },
        },
      });
      setSaved(true);
      router.refresh();
    });
  }

  const perLang = (base: string, lang: string, idx: number) =>
    ordered.length > 1
      ? `${base} · ${langName(lang)}${idx > 0 ? ` (${r.optional})` : ""}`
      : base;

  return (
    <Card>
      <CardBody className="flex flex-col gap-6">
        {/* Tagline */}
        <div className="grid gap-4 sm:grid-cols-2">
          {ordered.map((lang, idx) => (
            <Field key={lang} label={perLang(r.tagline, lang, idx)}>
              <Input
                dir={langDir(lang)}
                value={tagline[lang] ?? ""}
                onChange={(e) => {
                  dirty();
                  setTagline((s) => ({ ...s, [lang]: e.target.value }));
                }}
                placeholder={idx === 0 ? r.taglinePlaceholder : undefined}
              />
            </Field>
          ))}
        </div>

        {/* Contact & location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={r.phone}>
            <Input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                dirty();
                setPhone(e.target.value);
              }}
              placeholder="+964 7xx xxx xxxx"
            />
          </Field>
          <Field label={r.mapUrl} hint={r.mapUrlHint}>
            <Input
              dir="ltr"
              value={mapUrl}
              onChange={(e) => {
                dirty();
                setMapUrl(e.target.value);
              }}
              placeholder="https://maps.app.goo.gl/…"
            />
          </Field>
          {ordered.map((lang, idx) => (
            <Field key={lang} label={perLang(r.address, lang, idx)}>
              <Input
                dir={langDir(lang)}
                value={address[lang] ?? ""}
                onChange={(e) => {
                  dirty();
                  setAddress((s) => ({ ...s, [lang]: e.target.value }));
                }}
              />
            </Field>
          ))}
        </div>

        {/* Opening hours */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">{r.hours}</h3>
          <Switch
            checked={hours.length === 7}
            onChange={(on) => {
              dirty();
              setHours(on ? DEFAULT_WEEK.map((d) => ({ ...d })) : []);
            }}
            label={r.showHours}
          />
          {hours.length === 7 && (
            <>
              <div className="flex flex-col divide-y divide-[rgb(var(--color-border))] rounded-[var(--radius-active)] border border-[rgb(var(--color-border))]">
                {order.map((day) => {
                  const h = hours[day];
                  return (
                    <div key={day} className="flex flex-wrap items-center gap-3 px-3 py-2">
                      <span className="w-28 text-sm font-medium text-[rgb(var(--color-text))]">
                        {dayNames[day]}
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--color-muted))]">
                        <input
                          type="checkbox"
                          checked={h.closed}
                          onChange={(e) => setDay(day, { closed: e.target.checked })}
                        />
                        {r.closed}
                      </label>
                      {!h.closed && (
                        <div className="flex items-center gap-2" dir="ltr">
                          <input
                            type="time"
                            aria-label={`${dayNames[day]} · ${r.opens}`}
                            value={h.open}
                            onChange={(e) => setDay(day, { open: e.target.value })}
                            className="h-9 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-2 text-sm text-[rgb(var(--color-text))]"
                          />
                          <span className="text-[rgb(var(--color-muted))]">–</span>
                          <input
                            type="time"
                            aria-label={`${dayNames[day]} · ${r.closes}`}
                            value={h.close}
                            onChange={(e) => setDay(day, { close: e.target.value })}
                            className="h-9 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-2 text-sm text-[rgb(var(--color-text))]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    dirty();
                    const first = hours[order[0]];
                    setHours(hours.map(() => ({ ...first })));
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--color-primary))] hover:underline"
                >
                  <Copy className="h-4 w-4" />
                  {r.copyToAll.replace("{day}", dayNames[order[0]])}
                </button>
                <p className="text-xs text-[rgb(var(--color-muted))]">{r.overnightHint}</p>
              </div>
            </>
          )}
        </div>

        {/* Social media */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">{r.socials}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIALS.map((key) => (
              <Field key={key} label={r[key]}>
                <Input
                  dir="ltr"
                  value={socials[key]}
                  onChange={(e) => {
                    dirty();
                    setSocials((s) => ({ ...s, [key]: e.target.value }));
                  }}
                  placeholder={key === "website" ? "https://…" : r.socialHint}
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={pending}>
            {r.save}
          </Button>
          {saved && !pending && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              {r.saved}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
