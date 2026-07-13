"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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

/**
 * Split-screen Theme Builder. Owns the entire {@link ThemeConfig} in local state
 * (the shape that will later be the API payload). The left panel mutates it; the
 * right panel previews it live. Left 40% / right 60%; the preview is sticky.
 */
export function ThemeBuilder({ menu }: { menu: MenuView }) {
  const { locale, dictionary } = useI18n();
  const tb = dictionary.themeBuilder;

  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME_CONFIG);

  const update: UpdateConfig = (section, partial) =>
    setConfig((prev) => ({ ...prev, [section]: { ...prev[section], ...partial } }));

  const applyPreset = (preset: AdminPreset) =>
    setConfig((prev) => ({
      ...prev,
      brandColors: preset.colors,
      typography: preset.typography,
      components: preset.components,
    }));

  const reset = () => setConfig(DEFAULT_THEME_CONFIG);

  return (
    <div>
      <PageHeader
        title={tb.title}
        description={tb.subtitle}
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            {tb.reset}
          </Button>
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
