/**
 * Tenant theme configuration — the exact shape the backend API will accept, and
 * the single contract shared by the admin Theme Builder (which edits it) and the
 * public menu (which renders with it). Lives in `shared` so no feature depends on
 * another feature for it.
 */

import {
  DEFAULT_RESTAURANT_INFO,
  normalizeRestaurantInfo,
  type RestaurantInfo,
} from "@/shared/theme/restaurant-info";

/**
 * Public-menu layout mode:
 *  - "categories": category cards only (tap a category to view its items)
 *  - "nav":        horizontal category nav bar with items listed below
 *  - "sidebar":    category sidebar on the side, items in the main content area
 */
export type LayoutMode = "categories" | "nav" | "sidebar";
export type BorderRadiusToken = "none" | "sm" | "md" | "lg" | "full";
export type ShadowToken = "none" | "sm" | "md" | "lg";
export type ButtonStyleToken = "solid" | "outline";

export interface ThemeConfig {
  brandAssets: { logoUrl: string; coverImageUrl: string };
  languages: { default: string; supported: string[] };
  brandColors: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
  };
  typography: { headingFont: string; bodyFont: string };
  components: {
    layout: LayoutMode;
    borderRadius: BorderRadiusToken;
    shadow: ShadowToken;
    buttonStyle: ButtonStyleToken;
  };
  /**
   * Restaurant info (address, hours, phone, socials) — stored here until the
   * backend has real profile fields. Edited on the Restaurant settings page,
   * not in the Theme Builder.
   */
  info: RestaurantInfo;
}

/** Sensible "Modern Minimalist" default (matches the API's default payload). */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  brandAssets: { logoUrl: "", coverImageUrl: "" },
  languages: { default: "en", supported: ["en", "ar"] },
  brandColors: {
    background: "#ffffff",
    primary: "#ea580c",
    secondary: "#4b5563",
    text: "#1f2937",
  },
  typography: { headingFont: "Inter", bodyFont: "Roboto" },
  components: {
    layout: "nav",
    borderRadius: "md",
    shadow: "md",
    buttonStyle: "solid",
  },
  info: DEFAULT_RESTAURANT_INFO,
};

/**
 * Coerce a stored theme into a complete {@link ThemeConfig}: every section is the
 * default overlaid with whatever valid fields were saved. The backend theme
 * endpoint is a passthrough JSON store, so a partial, legacy or empty (`{}`)
 * payload must never reach the renderers — a missing `components` section used
 * to crash the public menu (`theme.components.layout` of undefined).
 */
export function normalizeThemeConfig(raw: unknown): ThemeConfig {
  const stored = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const section = <K extends keyof ThemeConfig>(key: K): ThemeConfig[K] => {
    const value = stored[key];
    return {
      ...DEFAULT_THEME_CONFIG[key],
      ...(value && typeof value === "object" && !Array.isArray(value) ? value : {}),
    } as ThemeConfig[K];
  };
  return {
    brandAssets: section("brandAssets"),
    languages: section("languages"),
    brandColors: section("brandColors"),
    typography: section("typography"),
    components: section("components"),
    info: normalizeRestaurantInfo(stored.info),
  };
}

/** Semantic tokens → concrete CSS values consumed by the menu renderer. */
export const RADIUS_VALUES: Record<BorderRadiusToken, string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
  full: "9999px",
};

export const SHADOW_VALUES: Record<ShadowToken, string> = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.06)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)",
  lg: "0 12px 20px -6px rgb(0 0 0 / 0.18)",
};

export const LAYOUT_OPTIONS: LayoutMode[] = ["categories", "nav", "sidebar"];
export const RADIUS_OPTIONS: BorderRadiusToken[] = ["none", "sm", "md", "lg", "full"];
export const SHADOW_OPTIONS: ShadowToken[] = ["none", "sm", "md", "lg"];
export const BUTTON_STYLE_OPTIONS: ButtonStyleToken[] = ["solid", "outline"];
