/** Public barrel for the theme system. */
export type {
  RestaurantTheme,
  ThemeColors,
  ThemePreset,
  ThemeLayout,
  ThemeDirection,
  BorderRadius,
  ShadowStyle,
  ButtonStyle,
} from "@/shared/theme/types";
export {
  ThemeProvider,
  useTheme,
  applyThemeToElement,
  activeRadius,
  activeShadow,
} from "@/shared/theme/ThemeProvider";
export { PRESETS, PRESET_LABELS, LAYOUT_LABELS, FONT_OPTIONS } from "@/shared/theme/presets";
export type { FontOption } from "@/shared/theme/presets";
export { ADMIN_THEME, defaultTheme } from "@/shared/theme/adminTheme";
