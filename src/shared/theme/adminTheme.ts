import type { RestaurantTheme, ThemeDirection } from "@/shared/theme/types";

/**
 * Neutral chrome theme for both dashboards, so admin UI stays brand-neutral
 * regardless of the tenant's customer-facing theme.
 */
export const ADMIN_THEME: RestaurantTheme = {
  preset: "custom",
  layout: "grid",
  direction: "ltr",
  colors: {
    primary: "15 23 42",
    primaryFg: "255 255 255",
    secondary: "22 163 74",
    accent: "5 150 105",
    background: "248 250 252",
    surface: "255 255 255",
    text: "15 23 42",
    muted: "100 116 139",
    border: "226 232 240",
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFamily: "'Inter', system-ui, sans-serif",
  },
  components: { borderRadius: "md", shadow: "soft", buttonStyle: "rounded" },
};

/**
 * The default MenuNova brand theme — mirrors the `:root` palette in globals.css.
 * Used to seed `--radius-active` / `--shadow-active` for SSR and as the base for
 * marketing/public surfaces before a tenant theme is applied. `direction` is set
 * from the active locale by the caller.
 */
export function defaultTheme(direction: ThemeDirection = "ltr"): RestaurantTheme {
  return {
    preset: "custom",
    layout: "grid",
    direction,
    colors: {
      primary: "15 23 42",
      primaryFg: "255 255 255",
      secondary: "22 163 74",
      accent: "5 150 105",
      background: "255 255 255",
      surface: "248 250 252",
      text: "15 23 42",
      muted: "100 116 139",
      border: "226 232 240",
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      headingFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    },
    components: { borderRadius: "md", shadow: "soft", buttonStyle: "rounded" },
  };
}
