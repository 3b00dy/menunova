"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Save, Check } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { PageHeader, Button } from "@/shared/ui";
import type { MenuView } from "@/features/menu";
import {
  DEFAULT_THEME_CONFIG,
  type ThemeConfig,
} from "@/features/theme-builder/domain/theme-config";
import type { AdminPreset } from "@/features/theme-builder/infrastructure/theme-presets";
import { SettingsPanel, type UpdateConfig } from "@/features/theme-builder/ui/SettingsPanel";
import { LivePreview } from "@/features/theme-builder/ui/LivePreview";
// Import the action directly (not via the restaurant barrel) to keep server-only
// siblings out of this client bundle.
import { saveRestaurantTheme } from "@/features/restaurant/application/save-restaurant-theme";

/**
 * Split-screen Theme Builder. Owns the entire {@link ThemeConfig} in local state
 * (the API payload shape). The left panel mutates it; the right panel previews it
 * live. `initialConfig` is the restaurant's saved theme; **Save** persists the
 * current config for `slug` so the public `/r/{slug}` menu adopts it.
 */
export function ThemeBuilder({
  menu,
  slug,
  initialConfig,
}: {
  menu: MenuView;
  slug: string;
  initialConfig: ThemeConfig;
}) {
  const { locale, dictionary } = useI18n();
  const tb = dictionary.themeBuilder;

  const [config, setConfig] = useState<ThemeConfig>(initialConfig);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update: UpdateConfig = (section, partial) => {
    setSaved(false);
    setConfig((prev) => ({ ...prev, [section]: { ...prev[section], ...partial } }));
  };

  const applyPreset = (preset: AdminPreset) => {
    setSaved(false);
    setConfig((prev) => ({
      ...prev,
      brandColors: preset.colors,
      typography: preset.typography,
      components: preset.components,
    }));
  };

  const reset = () => {
    setSaved(false);
    setConfig(DEFAULT_THEME_CONFIG);
  };

  const save = () =>
    startTransition(async () => {
      await saveRestaurantTheme({ locale, slug, theme: config });
      setSaved(true);
    });

  return (
    <div>
      <PageHeader
        title={tb.title}
        description={tb.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset} disabled={pending}>
              <RotateCcw className="h-4 w-4" />
              {tb.reset}
            </Button>
            <Button size="sm" onClick={save} disabled={pending}>
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? tb.saved : pending ? tb.saving : tb.save}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="min-w-0">
          <SettingsPanel
            config={config}
            update={update}
            applyPreset={applyPreset}
            tb={tb}
            locale={locale}
          />
        </div>
        <div className="min-w-0 self-start lg:sticky lg:top-6">
          <LivePreview config={config} tb={tb} menu={menu} />
        </div>
      </div>
    </div>
  );
}
