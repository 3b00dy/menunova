import type { RestaurantTheme, ThemePreset, ThemeLayout } from "@/shared/theme/types";

/** Four built-in customer-menu looks. Values mirror the `.theme-*` CSS classes. */
export const PRESETS: Record<
  Exclude<ThemePreset, "custom">,
  RestaurantTheme
> = {
  luxury: {
    preset: "luxury",
    layout: "luxury",
    direction: "ltr",
    colors: {
      primary: "18 18 18",
      primaryFg: "248 226 165",
      secondary: "212 175 55",
      accent: "250 204 21",
      background: "12 12 12",
      surface: "24 24 24",
      text: "245 245 245",
      muted: "161 161 170",
      border: "39 39 42",
    },
    typography: {
      fontFamily: "'Playfair Display', Georgia, serif",
      headingFamily: "'Playfair Display', Georgia, serif",
    },
    components: { borderRadius: "sm", shadow: "pronounced", buttonStyle: "square" },
  },
  "modern-minimal": {
    preset: "modern-minimal",
    layout: "grid",
    direction: "ltr",
    colors: {
      primary: "17 17 17",
      primaryFg: "255 255 255",
      secondary: "99 102 241",
      accent: "79 70 229",
      background: "255 255 255",
      surface: "249 250 251",
      text: "17 17 17",
      muted: "107 114 128",
      border: "229 231 235",
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFamily: "'Inter', system-ui, sans-serif",
    },
    components: { borderRadius: "md", shadow: "soft", buttonStyle: "rounded" },
  },
  "fast-food": {
    preset: "fast-food",
    layout: "delivery",
    direction: "ltr",
    colors: {
      primary: "220 38 38",
      primaryFg: "255 255 255",
      secondary: "250 204 21",
      accent: "234 88 12",
      background: "255 251 235",
      surface: "255 255 255",
      text: "23 23 23",
      muted: "120 113 108",
      border: "254 215 170",
    },
    typography: {
      fontFamily: "'Poppins', system-ui, sans-serif",
      headingFamily: "'Poppins', system-ui, sans-serif",
    },
    components: { borderRadius: "lg", shadow: "soft", buttonStyle: "pill" },
  },
  "traditional-arabic": {
    preset: "traditional-arabic",
    layout: "classic",
    direction: "rtl",
    colors: {
      primary: "120 53 15",
      primaryFg: "254 243 199",
      secondary: "180 83 9",
      accent: "217 119 6",
      background: "255 251 235",
      surface: "254 243 199",
      text: "41 37 36",
      muted: "120 113 108",
      border: "231 187 122",
    },
    typography: {
      fontFamily: "'Cairo', system-ui, sans-serif",
      headingFamily: "'Cairo', system-ui, sans-serif",
    },
    components: { borderRadius: "md", shadow: "soft", buttonStyle: "rounded" },
  },
};

export const PRESET_LABELS: Record<ThemePreset, string> = {
  luxury: "Luxury Dark + Gold",
  "modern-minimal": "Modern Minimal",
  "fast-food": "Fast Food Vibrant",
  "traditional-arabic": "Traditional Arabic",
  custom: "Custom",
};

export const LAYOUT_LABELS: Record<ThemeLayout, string> = {
  delivery: "Delivery Style",
  luxury: "Luxury Restaurant",
  grid: "Visual Grid",
  classic: "Classic Menu",
};

export interface FontOption {
  value: string;
  label: string;
  category: "sans" | "serif" | "display" | "multilingual";
  note?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: "'Inter', system-ui, sans-serif", label: "Inter", category: "sans" },
  { value: "'Poppins', system-ui, sans-serif", label: "Poppins", category: "sans" },
  { value: "'Manrope', system-ui, sans-serif", label: "Manrope", category: "sans" },
  { value: "'DM Sans', system-ui, sans-serif", label: "DM Sans", category: "sans" },
  { value: "'Playfair Display', Georgia, serif", label: "Playfair Display", category: "display", note: "Elegant headings" },
  { value: "'Cormorant Garamond', Georgia, serif", label: "Cormorant Garamond", category: "serif", note: "Editorial serif" },
  { value: "'Cairo', system-ui, sans-serif", label: "Cairo", category: "multilingual", note: "Latin + Arabic" },
  { value: "'Tajawal', system-ui, sans-serif", label: "Tajawal", category: "multilingual", note: "Latin + Arabic" },
  { value: "'Almarai', system-ui, sans-serif", label: "Almarai", category: "multilingual", note: "Latin + Arabic" },
  { value: "system-ui, -apple-system, sans-serif", label: "System default", category: "sans" },
];
