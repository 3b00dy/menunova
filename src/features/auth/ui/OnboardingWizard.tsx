"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Lock,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { routes } from "@/shared/config/routes";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { Button, Card, Field, Input, BrandLogo } from "@/shared/ui";
import {
  RESTAURANT_PLANS,
  type RestaurantPlan,
} from "@/features/restaurant/domain/restaurant.entity";
import { registerOwner } from "@/features/auth/application/registerOwner";

type StepId = "account" | "plan" | "restaurant" | "theme" | "payment";
const STEP_IDS: StepId[] = ["account", "plan", "restaurant", "theme", "payment"];

/** Cosmetic monthly price per plan (mock checkout — nothing is charged). */
const PLAN_PRICES: Record<RestaurantPlan, number> = { free: 0, pro: 49, enterprise: 99 };
const RECOMMENDED_PLAN: RestaurantPlan = "pro";

/** Brand-color swatches for the theme step; stored as the restaurant's brandColor. */
const BRAND_COLORS = ["#D97706", "#DC2626", "#059669", "#2563EB", "#7C3AED", "#DB2777", "#0891B2", "#CA8A04"];

const LANG_CODES = Object.keys(SUPPORTED_LANGUAGES);
const langName = (code: string) => SUPPORTED_LANGUAGES[code]?.name ?? code.toUpperCase();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface State {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  plan: RestaurantPlan;
  restaurantName: string;
  slug: string;
  slugTouched: boolean;
  logoUrl: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  brandColor: string;
  cardholder: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const INITIAL: State = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  plan: "free",
  restaurantName: "",
  slug: "",
  slugTouched: false,
  logoUrl: "",
  supportedLanguages: ["en", "ar"],
  defaultLanguage: "en",
  brandColor: BRAND_COLORS[0],
  cardholder: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

/**
 * Multi-step self-serve onboarding: account → plan → restaurant → theme →
 * payment. On completion it calls the `registerOwner` Server Action, which
 * provisions the restaurant + its language settings, logs the owner in, and
 * redirects to their dashboard. Payment is mocked (no charge). Fields map only
 * to what the API stores (name, slug, plan, logo, brand color, languages).
 */
export function OnboardingWizard() {
  const { locale, dictionary: t } = useI18n();
  const o = t.onboarding;
  const [step, setStep] = useState<StepId>("account");
  const [state, setState] = useState<State>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stepIndex = STEP_IDS.indexOf(step);
  const next = () => setStep(STEP_IDS[Math.min(stepIndex + 1, STEP_IDS.length - 1)]);
  const back = () => setStep(STEP_IDS[Math.max(stepIndex - 1, 0)]);
  const patch = (p: Partial<State>) => setState((s) => ({ ...s, ...p }));

  const setRestaurantName = (name: string) =>
    patch({ restaurantName: name, slug: state.slugTouched ? state.slug : slugify(name) });
  const setSlug = (slug: string) => patch({ slug: slugify(slug), slugTouched: true });

  function toggleLanguage(code: string) {
    const has = state.supportedLanguages.includes(code);
    let supported = has
      ? state.supportedLanguages.filter((c) => c !== code)
      : [...state.supportedLanguages, code];
    if (supported.length === 0) supported = [code];
    const defaultLanguage = supported.includes(state.defaultLanguage)
      ? state.defaultLanguage
      : supported[0];
    patch({ supportedLanguages: supported, defaultLanguage });
  }

  function complete() {
    setError(null);
    startTransition(async () => {
      const res = await registerOwner({
        locale,
        name: state.fullName,
        email: state.email,
        password: state.password,
        restaurant: {
          name: state.restaurantName,
          slug: state.slug || slugify(state.restaurantName),
          plan: state.plan,
          logoUrl: state.logoUrl || undefined,
          brandColor: state.brandColor,
        },
        defaultLanguage: state.defaultLanguage,
        supportedLanguages: state.supportedLanguages,
      });
      if (res?.error) {
        const errors = o.errors as Record<string, string>;
        setError(errors[res.error] ?? o.errors.generic);
        if (res.error === "slug_taken") setStep("restaurant");
        else if (res.error === "email_taken") setStep("account");
      }
      // On success the action redirects to the dashboard.
    });
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]">
      <header className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href={routes.home(locale)}>
            <BrandLogo />
          </Link>
          <span className="hidden text-xs text-[rgb(var(--color-muted))] sm:inline">
            {o.header.haveAccount}{" "}
            <Link href={routes.login(locale)} className="font-medium text-[rgb(var(--color-primary))] underline">
              {o.header.signIn}
            </Link>
          </span>
        </div>
      </header>

      <Stepper currentIndex={stepIndex} labels={o.steps} />

      <main className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        {step === "account" && <AccountStep state={state} patch={patch} labels={o.account} onNext={next} />}
        {step === "plan" && (
          <PlanStep
            selected={state.plan}
            onSelect={(plan) => patch({ plan })}
            labels={o.plan}
            planNames={t.dashboard.restaurantsAdmin.plans}
            onNext={next}
            onBack={back}
          />
        )}
        {step === "restaurant" && (
          <RestaurantStep
            state={state}
            labels={o.restaurant}
            setRestaurantName={setRestaurantName}
            setSlug={setSlug}
            patch={patch}
            toggleLanguage={toggleLanguage}
            onNext={next}
            onBack={back}
          />
        )}
        {step === "theme" && (
          <ThemeStep
            brandColor={state.brandColor}
            onSelect={(brandColor) => patch({ brandColor })}
            labels={o.theme}
            onNext={next}
            onBack={back}
          />
        )}
        {step === "payment" && (
          <PaymentStep
            state={state}
            patch={patch}
            labels={o.payment}
            planName={t.dashboard.restaurantsAdmin.plans[state.plan]}
            price={PLAN_PRICES[state.plan]}
            error={error}
            pending={pending}
            onComplete={complete}
            onBack={back}
          />
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------

type O = ReturnType<typeof useI18n>["dictionary"]["onboarding"];

function Stepper({ currentIndex, labels }: { currentIndex: number; labels: O["steps"] }) {
  return (
    <div className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-1 px-4 py-4 sm:gap-3 sm:px-6">
        {STEP_IDS.map((id, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <Fragment key={id}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]"
                        : "border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-muted))]"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`hidden text-[10px] sm:inline sm:text-xs ${
                    active ? "font-semibold text-[rgb(var(--color-text))]" : "text-[rgb(var(--color-muted))]"
                  }`}
                >
                  {labels[id]}
                </span>
              </div>
              {i < STEP_IDS.length - 1 && (
                <div className={`h-px w-6 sm:w-10 ${done ? "bg-emerald-500" : "bg-[rgb(var(--color-border))]"}`} />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8 mt-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-[rgb(var(--color-muted))]">{description}</p>
      )}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  const { dictionary: t } = useI18n();
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <div>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t.common.back}
          </Button>
        )}
      </div>
      <Button onClick={onNext} disabled={nextDisabled} size="lg">
        {nextLabel}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}

function AccountStep({
  state,
  patch,
  labels,
  onNext,
}: {
  state: State;
  patch: (p: Partial<State>) => void;
  labels: O["account"];
  onNext: () => void;
}) {
  const { dictionary: t } = useI18n();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
  const passwordOk = state.password.length >= 8;
  const match = state.password.length > 0 && state.password === state.confirmPassword;
  const canContinue = state.fullName.trim().length >= 2 && emailOk && passwordOk && match;

  return (
    <>
      <StepHeader title={labels.title} description={labels.subtitle} />
      <Card className="space-y-5 p-6 sm:p-8">
        <Field label={labels.fullName}>
          <div className="relative">
            <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-muted))]" />
            <Input
              autoFocus
              value={state.fullName}
              onChange={(e) => patch({ fullName: e.target.value })}
              className="ps-9"
              placeholder={labels.fullNamePlaceholder}
            />
          </div>
        </Field>
        <Field label={labels.email}>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-muted))]" />
            <Input
              type="email"
              value={state.email}
              onChange={(e) => patch({ email: e.target.value })}
              className="ps-9"
              placeholder={labels.emailPlaceholder}
            />
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={labels.password} hint={state.password && !passwordOk ? labels.passwordHint : undefined}>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-muted))]" />
              <Input
                type="password"
                autoComplete="new-password"
                value={state.password}
                onChange={(e) => patch({ password: e.target.value })}
                className="ps-9"
                placeholder="••••••••"
              />
            </div>
          </Field>
          <Field
            label={labels.confirmPassword}
            hint={state.confirmPassword && !match ? labels.passwordMismatch : undefined}
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={state.confirmPassword}
              onChange={(e) => patch({ confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
          </Field>
        </div>
        <p className="text-xs text-[rgb(var(--color-muted))]">{labels.terms}</p>
      </Card>
      <StepNav onNext={onNext} nextDisabled={!canContinue} nextLabel={t.common.continue} />
    </>
  );
}

function PlanStep({
  selected,
  onSelect,
  labels,
  planNames,
  onNext,
  onBack,
}: {
  selected: RestaurantPlan;
  onSelect: (p: RestaurantPlan) => void;
  labels: O["plan"];
  planNames: Record<RestaurantPlan, string>;
  onNext: () => void;
  onBack: () => void;
}) {
  const { dictionary: t } = useI18n();
  return (
    <>
      <StepHeader title={labels.title} description={labels.subtitle} />
      <div className="grid gap-4 md:grid-cols-3">
        {RESTAURANT_PLANS.map((plan) => {
          const active = selected === plan;
          const price = PLAN_PRICES[plan];
          const item = labels.items[plan];
          return (
            <button
              key={plan}
              type="button"
              onClick={() => onSelect(plan)}
              className={`relative rounded-2xl border p-6 text-start transition-all ${
                active
                  ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-bg))] ring-2 ring-[rgb(var(--color-accent))]/30"
                  : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] hover:-translate-y-0.5"
              }`}
            >
              {plan === RECOMMENDED_PLAN && (
                <span className="absolute -top-3 start-6 inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-primary))] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary-fg))]">
                  <Sparkles className="h-3 w-3" /> {labels.recommended}
                </span>
              )}
              <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
                {planNames[plan]}
              </div>
              <div className="mt-1 text-sm text-[rgb(var(--color-muted))]">{item.tagline}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{price === 0 ? labels.free : `$${price}`}</span>
                {price > 0 && <span className="text-[rgb(var(--color-muted))]">{labels.perMonth}</span>}
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      <StepNav onBack={onBack} onNext={onNext} nextLabel={t.common.continue} />
    </>
  );
}

function RestaurantStep({
  state,
  labels,
  setRestaurantName,
  setSlug,
  patch,
  toggleLanguage,
  onNext,
  onBack,
}: {
  state: State;
  labels: O["restaurant"];
  setRestaurantName: (v: string) => void;
  setSlug: (v: string) => void;
  patch: (p: Partial<State>) => void;
  toggleLanguage: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { dictionary: t } = useI18n();
  const canContinue =
    state.restaurantName.trim().length >= 2 &&
    state.slug.length >= 2 &&
    state.supportedLanguages.length >= 1;

  return (
    <>
      <StepHeader title={labels.title} description={labels.subtitle} />
      <Card className="space-y-5 p-6 sm:p-8">
        <Field label={labels.name}>
          <Input
            autoFocus
            value={state.restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder={labels.namePlaceholder}
          />
        </Field>
        <Field label={labels.slug} hint={labels.slugHint}>
          <div className="flex items-center rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] focus-within:ring-2 focus-within:ring-[rgb(var(--color-accent))]">
            <span className="ps-3 text-sm text-[rgb(var(--color-muted))]">/r/</span>
            <input
              value={state.slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tonys-pizza"
              className="h-10 flex-1 bg-transparent px-2 text-sm focus:outline-none"
            />
          </div>
        </Field>
        <Field label={labels.logo} hint={labels.logoHint}>
          <Input
            value={state.logoUrl}
            onChange={(e) => patch({ logoUrl: e.target.value })}
            placeholder="https://…"
          />
        </Field>
        <Field label={labels.languages} hint={labels.languagesHint}>
          <div className="flex flex-wrap gap-2">
            {LANG_CODES.map((code) => {
              const on = state.supportedLanguages.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleLanguage(code)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    on
                      ? "border-transparent bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]"
                      : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary))]"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                  {langName(code)}
                </button>
              );
            })}
          </div>
        </Field>
        {state.supportedLanguages.length > 1 && (
          <Field label={labels.defaultLanguage}>
            <select
              value={state.defaultLanguage}
              onChange={(e) => patch({ defaultLanguage: e.target.value })}
              className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
            >
              {state.supportedLanguages.map((code) => (
                <option key={code} value={code}>
                  {langName(code)}
                </option>
              ))}
            </select>
          </Field>
        )}
      </Card>
      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!canContinue} nextLabel={t.common.continue} />
    </>
  );
}

function ThemeStep({
  brandColor,
  onSelect,
  labels,
  onNext,
  onBack,
}: {
  brandColor: string;
  onSelect: (color: string) => void;
  labels: O["theme"];
  onNext: () => void;
  onBack: () => void;
}) {
  const { dictionary: t } = useI18n();
  return (
    <>
      <StepHeader title={labels.title} description={labels.subtitle} />
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((color) => {
            const active = brandColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                onClick={() => onSelect(color)}
                className={`grid h-12 w-12 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-[rgb(var(--color-bg))] transition-transform hover:scale-105 ${
                  active ? "ring-[rgb(var(--color-text))]" : "ring-transparent"
                }`}
                style={{ backgroundColor: color }}
              >
                {active && <Check className="h-5 w-5 text-white" />}
              </button>
            );
          })}
        </div>
        <Field label={labels.customColor}>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => onSelect(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-transparent"
              aria-label={labels.customColor}
            />
            <Input value={brandColor} onChange={(e) => onSelect(e.target.value)} className="max-w-40" />
          </div>
        </Field>
      </Card>
      <StepNav onBack={onBack} onNext={onNext} nextLabel={t.common.continue} />
    </>
  );
}

function PaymentStep({
  state,
  patch,
  labels,
  planName,
  price,
  error,
  pending,
  onComplete,
  onBack,
}: {
  state: State;
  patch: (p: Partial<State>) => void;
  labels: O["payment"];
  planName: string;
  price: number;
  error: string | null;
  pending: boolean;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { dictionary: t } = useI18n();
  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
  };
  const cardDigits = state.cardNumber.replace(/\s/g, "");
  const free = price === 0;
  const canPay =
    free ||
    (state.cardholder.trim().length >= 2 &&
      cardDigits.length >= 12 &&
      /^\d{2}\/\d{2}$/.test(state.expiry) &&
      /^\d{3,4}$/.test(state.cvc));

  return (
    <>
      <StepHeader title={labels.title} description={labels.subtitle} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-[rgb(var(--color-muted))]" />
            <h2 className="font-semibold">{labels.sectionTitle}</h2>
          </div>
          <Field label={labels.cardholder}>
            <Input
              value={state.cardholder}
              onChange={(e) => patch({ cardholder: e.target.value })}
              placeholder={state.fullName || labels.cardholderPlaceholder}
            />
          </Field>
          <Field label={labels.cardNumber}>
            <Input
              value={state.cardNumber}
              onChange={(e) => patch({ cardNumber: formatCardNumber(e.target.value) })}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={labels.expiry}>
              <Input
                value={state.expiry}
                onChange={(e) => patch({ expiry: formatExpiry(e.target.value) })}
                placeholder="MM/YY"
                inputMode="numeric"
              />
            </Field>
            <Field label={labels.cvc}>
              <Input
                value={state.cvc}
                onChange={(e) => patch({ cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="123"
                inputMode="numeric"
              />
            </Field>
          </div>
          <p className="flex items-center gap-1 text-xs text-[rgb(var(--color-muted))]">
            <Lock className="h-3 w-3" /> {labels.demoNote}
          </p>
        </Card>

        <Card className="h-fit space-y-5 p-6">
          <div>
            <h3 className="font-semibold">{labels.summary}</h3>
            <p className="text-xs text-[rgb(var(--color-muted))]">{labels.summarySub}</p>
          </div>
          <div className="space-y-3 text-sm">
            <SummaryRow label={labels.planLabel} value={planName} />
            <SummaryRow label={labels.restaurantLabel} value={state.restaurantName || "—"} />
            <SummaryRow label={labels.menuUrl} value={`/r/${state.slug || "—"}`} />
            <SummaryRow label={labels.languageLabel} value={langName(state.defaultLanguage)} />
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-xs uppercase tracking-wider text-[rgb(var(--color-muted))]">
                {labels.themeLabel}
              </span>
              <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: state.brandColor }} />
            </div>
          </div>
          <div className="border-t border-[rgb(var(--color-border))] pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[rgb(var(--color-muted))]">{labels.dueToday}</span>
              <span className="text-2xl font-semibold">{free ? labels.free : `$${price}`}</span>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button block size="lg" onClick={onComplete} disabled={!canPay || pending}>
            {pending ? labels.processing : labels.pay}
          </Button>
        </Card>
      </div>
      <div className="mt-6">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {t.common.back}
        </Button>
      </div>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-xs uppercase tracking-wider text-[rgb(var(--color-muted))]">{label}</span>
      <span className="truncate text-end font-medium">{value}</span>
    </div>
  );
}
