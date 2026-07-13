"use client";

import type { Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/getDictionary";
import { Input } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import {
  type ThemeConfig,
  BUTTON_STYLE_OPTIONS,
  LAYOUT_OPTIONS,
  RADIUS_OPTIONS,
  SHADOW_OPTIONS,
} from "@/features/theme-builder/domain/theme-config";
import {
  ADMIN_PRESETS,
  FONT_OPTIONS,
  LANGUAGE_OPTIONS,
  type AdminPreset,
} from "@/features/theme-builder/infrastructure/theme-presets";
import { SectionCard, SegmentedControl, ColorField } from "@/features/theme-builder/ui/controls";

type TB = Dictionary["themeBuilder"];

/** Type-safe section patcher passed down from the container. */
export type UpdateConfig = <K extends keyof ThemeConfig>(
  section: K,
  partial: Partial<ThemeConfig[K]>,
) => void;

export interface SettingsPanelProps {
  config: ThemeConfig;
  update: UpdateConfig;
  applyPreset: (preset: AdminPreset) => void;
  tb: TB;
  locale: Locale;
}

export function SettingsPanel({ config, update, applyPreset, tb, locale }: SettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <PresetsSection tb={tb} locale={locale} onApply={applyPreset} />
      <BrandAssetsSection tb={tb} config={config} update={update} />
      <LanguagesSection tb={tb} config={config} update={update} />
      <BrandColorsSection tb={tb} config={config} update={update} />
      <TypographySection tb={tb} config={config} update={update} />
      <ComponentsSection tb={tb} config={config} update={update} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PresetsSection({
  tb,
  locale,
  onApply,
}: {
  tb: TB;
  locale: Locale;
  onApply: (preset: AdminPreset) => void;
}) {
  return (
    <SectionCard title={tb.sections.presets} hint={tb.sections.presetsHint}>
      <div className="grid gap-2 sm:grid-cols-3">
        {ADMIN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset)}
            className="group rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] p-3 text-start transition-colors hover:border-[rgb(var(--color-accent))]"
          >
            <div
              className="mb-2 h-10 w-full rounded-md"
              style={{ backgroundColor: preset.colors.background, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.06)" }}
            >
              <div className="flex h-full items-center gap-1 px-2">
                {[preset.colors.primary, preset.colors.secondary, preset.colors.text].map(
                  (c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ),
                )}
              </div>
            </div>
            <span className="block text-xs font-medium text-[rgb(var(--color-text))]">
              {preset.name[locale] ?? preset.name.en}
            </span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function BrandAssetsSection({
  tb,
  config,
  update,
}: {
  tb: TB;
  config: ThemeConfig;
  update: UpdateConfig;
}) {
  return (
    <SectionCard title={tb.sections.brandAssets}>
      <div className="flex flex-col gap-3">
        <LabeledInput
          label={tb.fields.logoUrl}
          value={config.brandAssets.logoUrl}
          placeholder="https://…/logo.png"
          onChange={(v) => update("brandAssets", { logoUrl: v })}
        />
        <LabeledInput
          label={tb.fields.coverImageUrl}
          value={config.brandAssets.coverImageUrl}
          placeholder="https://…/cover.jpg"
          onChange={(v) => update("brandAssets", { coverImageUrl: v })}
        />
      </div>
    </SectionCard>
  );
}

function LanguagesSection({
  tb,
  config,
  update,
}: {
  tb: TB;
  config: ThemeConfig;
  update: UpdateConfig;
}) {
  const { supported, default: defaultLang } = config.languages;

  const toggleSupported = (code: string) => {
    const isOn = supported.includes(code);
    // Never drop the default language.
    if (isOn && code === defaultLang) return;
    const next = isOn ? supported.filter((c) => c !== code) : [...supported, code];
    update("languages", { supported: next });
  };

  return (
    <SectionCard title={tb.sections.languages}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[rgb(var(--color-muted))]">
            {tb.fields.supportedLanguages}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGE_OPTIONS.map((lang) => {
              const on = supported.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSupported(lang.code)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    on
                      ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-text))]"
                      : "border-[rgb(var(--color-border))] text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))]",
                    lang.code === defaultLang && "opacity-70",
                  )}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>
        </div>
        <Select
          label={tb.fields.defaultLanguage}
          value={defaultLang}
          onChange={(v) => update("languages", { default: v })}
          options={supported.map((code) => ({
            value: code,
            label: LANGUAGE_OPTIONS.find((l) => l.code === code)?.name ?? code,
          }))}
        />
      </div>
    </SectionCard>
  );
}

function BrandColorsSection({
  tb,
  config,
  update,
}: {
  tb: TB;
  config: ThemeConfig;
  update: UpdateConfig;
}) {
  const { background, primary, secondary, text } = config.brandColors;
  return (
    <SectionCard title={tb.sections.brandColors}>
      <div className="flex flex-col gap-3">
        <ColorField
          label={tb.fields.background}
          value={background}
          onChange={(v) => update("brandColors", { background: v })}
        />
        <ColorField
          label={tb.fields.primary}
          value={primary}
          onChange={(v) => update("brandColors", { primary: v })}
        />
        <ColorField
          label={tb.fields.secondary}
          value={secondary}
          onChange={(v) => update("brandColors", { secondary: v })}
        />
        <ColorField
          label={tb.fields.text}
          value={text}
          onChange={(v) => update("brandColors", { text: v })}
        />
      </div>
    </SectionCard>
  );
}

function TypographySection({
  tb,
  config,
  update,
}: {
  tb: TB;
  config: ThemeConfig;
  update: UpdateConfig;
}) {
  const fontOptions = FONT_OPTIONS.map((f) => ({ value: f, label: f }));
  return (
    <SectionCard title={tb.sections.typography}>
      <div className="flex flex-col gap-3">
        <Select
          label={tb.fields.headingFont}
          value={config.typography.headingFont}
          onChange={(v) => update("typography", { headingFont: v })}
          options={fontOptions}
        />
        <Select
          label={tb.fields.bodyFont}
          value={config.typography.bodyFont}
          onChange={(v) => update("typography", { bodyFont: v })}
          options={fontOptions}
        />
      </div>
    </SectionCard>
  );
}

function ComponentsSection({
  tb,
  config,
  update,
}: {
  tb: TB;
  config: ThemeConfig;
  update: UpdateConfig;
}) {
  const optionLabel = (key: string) =>
    (tb.options as Record<string, string>)[key] ?? key;

  return (
    <SectionCard title={tb.sections.components}>
      <div className="flex flex-col gap-4">
        <Control label={tb.fields.layout}>
          <SegmentedControl
            ariaLabel={tb.fields.layout}
            value={config.components.layout}
            onChange={(v) => update("components", { layout: v })}
            options={LAYOUT_OPTIONS.map((v) => ({ value: v, label: optionLabel(v) }))}
          />
        </Control>
        <Control label={tb.fields.borderRadius}>
          <SegmentedControl
            ariaLabel={tb.fields.borderRadius}
            value={config.components.borderRadius}
            onChange={(v) => update("components", { borderRadius: v })}
            options={RADIUS_OPTIONS.map((v) => ({ value: v, label: optionLabel(v) }))}
          />
        </Control>
        <Control label={tb.fields.shadow}>
          <SegmentedControl
            ariaLabel={tb.fields.shadow}
            value={config.components.shadow}
            onChange={(v) => update("components", { shadow: v })}
            options={SHADOW_OPTIONS.map((v) => ({ value: v, label: optionLabel(v) }))}
          />
        </Control>
        <Control label={tb.fields.buttonStyle}>
          <SegmentedControl
            ariaLabel={tb.fields.buttonStyle}
            value={config.components.buttonStyle}
            onChange={(v) => update("components", { buttonStyle: v })}
            options={BUTTON_STYLE_OPTIONS.map((v) => ({ value: v, label: optionLabel(v) }))}
          />
        </Control>
      </div>
    </SectionCard>
  );
}

/* --------------------------------- atoms --------------------------------- */

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{label}</span>
      {children}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{label}</span>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
