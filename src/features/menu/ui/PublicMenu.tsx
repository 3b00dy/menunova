"use client";

import { useState } from "react";
import { LayoutGrid, Rows3, PanelLeft, Globe, Check, type LucideIcon } from "lucide-react";
import type { ThemeConfig, LayoutMode } from "@/shared/theme/tenant-config";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { cn } from "@/shared/utils/cn";
import type { MenuView, MenuViewLabels } from "@/features/menu/domain/menu-view";
import { RestaurantMenu } from "@/features/menu/ui/RestaurantMenu";

export interface MenuChromeLabels {
  layout: string;
  categories: string;
  nav: string;
  sidebar: string;
  language: string;
}

const MODE_ICONS: Record<LayoutMode, LucideIcon> = {
  categories: LayoutGrid,
  nav: Rows3,
  sidebar: PanelLeft,
};

/**
 * Customer-facing public menu: the tenant-themed {@link RestaurantMenu} plus a
 * floating chrome (language switcher + layout switcher) so the diner can read
 * the menu in their language and preferred layout. Initial layout comes from the
 * tenant theme; both are overridable locally.
 */
export function PublicMenu({
  theme,
  data,
  labels,
  chrome,
  className,
}: {
  theme: ThemeConfig;
  data: MenuView;
  labels: MenuViewLabels;
  chrome: MenuChromeLabels;
  className?: string;
}) {
  const [layout, setLayout] = useState<LayoutMode>(theme.components.layout);

  const modeLabel: Record<LayoutMode, string> = {
    categories: chrome.categories,
    nav: chrome.nav,
    sidebar: chrome.sidebar,
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute end-3 top-3 z-20 flex items-center gap-2">
        <LanguageMenu
          supported={theme.languages.supported}
          label={chrome.language}
        />
        <div
          className="flex gap-0.5 rounded-full bg-black/45 p-1 backdrop-blur"
          role="radiogroup"
          aria-label={chrome.layout}
        >
          {(Object.keys(MODE_ICONS) as LayoutMode[]).map((mode) => {
            const Icon = MODE_ICONS[mode];
            const active = layout === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={modeLabel[mode]}
                title={modeLabel[mode]}
                onClick={() => setLayout(mode)}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full transition-colors",
                  active ? "bg-white text-black" : "text-white/80 hover:bg-white/15",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <RestaurantMenu theme={theme} data={data} layout={layout} labels={labels} />
    </div>
  );
}

function LanguageMenu({ supported, label }: { supported: string[]; label: string }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const codes = supported.filter((code) => SUPPORTED_LANGUAGES[code]);
  if (codes.length <= 1) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-full bg-black/45 px-3 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/60"
      >
        <Globe className="h-4 w-4" />
        {lang.toUpperCase()}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <ul
            role="menu"
            className="absolute end-0 top-11 z-20 min-w-36 overflow-hidden rounded-xl border border-black/10 bg-white py-1 text-sm text-zinc-900 shadow-xl"
          >
            {codes.map((code) => {
              const def = SUPPORTED_LANGUAGES[code];
              const active = code === lang;
              return (
                <li key={code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setOpen(false);
                      if (!active) setLang(code);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start hover:bg-zinc-100"
                  >
                    {def.name}
                    {active && <Check className="h-4 w-4 text-emerald-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
