"use client";

import { useState } from "react";
import { LayoutGrid, Rows3, PanelLeft, Globe, Check, type LucideIcon } from "lucide-react";
import type { ThemeConfig, LayoutMode } from "@/shared/theme/tenant-config";
import { useLanguage } from "@/shared/i18n/useLanguage";
import { languageDir, SUPPORTED_LANGUAGES } from "@/shared/i18n/languages";
import { cn } from "@/shared/utils/cn";
import type { MenuView, MenuViewLabels } from "@/features/menu/domain/menu-view";
import { RestaurantMenu } from "@/features/menu/ui/RestaurantMenu";

export interface MenuChromeLabels {
  layout: string;
  categories: string;
  nav: string;
  sidebar: string;
  language: string;
  /** Splash prompt, e.g. "Choose your language". */
  chooseLanguage: string;
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
 *
 * `languages` are the restaurant's enabled content languages (its language
 * settings) and `language` is the one `data` was localized in — it may differ
 * from the UI locale (e.g. Sorani `ckb` content under the Arabic UI).
 */
export function PublicMenu({
  theme,
  data,
  labels,
  chrome,
  languages,
  language,
  askLanguage = false,
  className,
}: {
  theme: ThemeConfig;
  data: MenuView;
  labels: MenuViewLabels;
  chrome: MenuChromeLabels;
  languages: string[];
  language: string;
  /** First visit to a multi-language menu: show the language splash (BR-QR-03). */
  askLanguage?: boolean;
  className?: string;
}) {
  const [layout, setLayout] = useState<LayoutMode>(theme.components.layout);
  const [splashOpen, setSplashOpen] = useState(askLanguage);

  const modeLabel: Record<LayoutMode, string> = {
    categories: chrome.categories,
    nav: chrome.nav,
    sidebar: chrome.sidebar,
  };

  return (
    <div className={cn("relative", className)} dir={languageDir(language)} lang={language}>
      <div className="absolute end-3 top-3 z-20 flex items-center gap-2">
        <LanguageMenu supported={languages} current={language} label={chrome.language} />
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

      {splashOpen && (
        <LanguageSplash
          theme={theme}
          restaurantName={data.restaurant.name}
          prompt={chrome.chooseLanguage}
          languages={languages}
          current={language}
          onDone={() => setSplashOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Branded first-visit splash (BRD BR-QR-03 / US-QR-02): the restaurant's logo,
 * name and colours, and its enabled languages — each named in its own script so
 * any guest can find theirs. The choice is remembered on the device.
 */
function LanguageSplash({
  theme,
  restaurantName,
  prompt,
  languages,
  current,
  onDone,
}: {
  theme: ThemeConfig;
  restaurantName: string;
  prompt: string;
  languages: string[];
  current: string;
  onDone: () => void;
}) {
  const { setMenuLanguage, rememberMenuLanguage } = useLanguage();
  const codes = languages.filter((code) => SUPPORTED_LANGUAGES[code]);
  const { brandColors: c, brandAssets, typography } = theme;

  const choose = (code: string) => {
    onDone();
    if (code === current) rememberMenuLanguage(code);
    else setMenuLanguage(code);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-splash-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 p-6 text-center"
      style={{
        backgroundColor: c.background,
        color: c.text,
        fontFamily: `'${typography.bodyFont}', 'Noto Sans Arabic', system-ui, sans-serif`,
      }}
    >
      <div className="flex flex-col items-center gap-3">
        {brandAssets.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brandAssets.logoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <span
            aria-hidden
            className="grid h-20 w-20 place-items-center rounded-2xl text-3xl font-bold text-white"
            style={{ backgroundColor: c.primary }}
          >
            {restaurantName.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <h1 className="text-2xl font-bold">{restaurantName}</h1>
        <p id="language-splash-title" className="flex items-center gap-1.5 text-sm opacity-70">
          <Globe className="h-4 w-4" />
          {prompt}
        </p>
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-3">
        {codes.map((code, i) => {
          const def = SUPPORTED_LANGUAGES[code];
          return (
            <li key={code}>
              <button
                type="button"
                autoFocus={i === 0}
                lang={code}
                dir={def.dir}
                onClick={() => choose(code)}
                className="h-12 w-full rounded-full text-base font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: c.primary }}
              >
                {def.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LanguageMenu({
  supported,
  current,
  label,
}: {
  supported: string[];
  current: string;
  label: string;
}) {
  const { setMenuLanguage } = useLanguage();
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
        {SUPPORTED_LANGUAGES[current]?.badge ?? current.toUpperCase()}
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
              const active = code === current;
              return (
                <li key={code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setOpen(false);
                      if (!active) setMenuLanguage(code);
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
