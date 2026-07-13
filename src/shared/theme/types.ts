/**
 * The tenant look model. The Theme Builder edits it; {@link ThemeProvider}
 * applies it by writing CSS custom properties. Colors are "r g b" triplets
 * (e.g. "15 23 42") so components can use `rgb(var(--color-x))` with opacity
 * modifiers.
 */
export type ThemePreset =
  | "luxury"
  | "modern-minimal"
  | "fast-food"
  | "traditional-arabic"
  | "custom";

export type ThemeLayout = "delivery" | "luxury" | "grid" | "classic";
export type ThemeDirection = "ltr" | "rtl";
export type BorderRadius = "sm" | "md" | "lg" | "pill";
export type ShadowStyle = "none" | "soft" | "pronounced";
export type ButtonStyle = "rounded" | "pill" | "square";

export interface ThemeColors {
  primary: string;
  primaryFg: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface RestaurantTheme {
  preset: ThemePreset;
  layout: ThemeLayout;
  direction: ThemeDirection;
  colors: ThemeColors;
  typography: { fontFamily: string; headingFamily: string };
  components: {
    borderRadius: BorderRadius;
    shadow: ShadowStyle;
    buttonStyle: ButtonStyle;
  };
}
