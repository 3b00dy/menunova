import type { ThemeConfig } from "@/features/theme-builder/domain/theme-config";

/**
 * System default themes an admin can start from. Applying a preset overwrites
 * the style-related state (colors, typography, components) while preserving the
 * tenant's own brand assets and language settings.
 */
export interface AdminPreset {
  id: string;
  /** Bilingual display name (per the app's en/ar rule). */
  name: { en: string; ar: string };
  colors: ThemeConfig["brandColors"];
  typography: ThemeConfig["typography"];
  components: ThemeConfig["components"];
}

export const ADMIN_PRESETS: AdminPreset[] = [
  {
    id: "cafe-minimal",
    name: { en: "Cafe Minimal", ar: "مقهى بسيط" },
    colors: {
      background: "#ffffff",
      primary: "#0f766e",
      secondary: "#6b7280",
      text: "#111827",
    },
    typography: { headingFont: "Inter", bodyFont: "Inter" },
    components: {
      layout: "categories",
      borderRadius: "md",
      shadow: "sm",
      buttonStyle: "solid",
    },
  },
  {
    id: "elegant-steakhouse",
    name: { en: "Elegant Steakhouse", ar: "ستيك هاوس أنيق" },
    colors: {
      background: "#111111",
      primary: "#c59d5f",
      secondary: "#8a8578",
      text: "#f5f5f4",
    },
    typography: { headingFont: "Playfair Display", bodyFont: "Cormorant Garamond" },
    components: {
      layout: "sidebar",
      borderRadius: "sm",
      shadow: "lg",
      buttonStyle: "outline",
    },
  },
  {
    id: "vibrant-taco-shop",
    name: { en: "Vibrant Taco Shop", ar: "محل تاكو نابض" },
    colors: {
      background: "#fff7ed",
      primary: "#ea580c",
      secondary: "#ca8a04",
      text: "#1c1917",
    },
    typography: { headingFont: "Poppins", bodyFont: "Poppins" },
    components: {
      layout: "nav",
      borderRadius: "lg",
      shadow: "md",
      buttonStyle: "solid",
    },
  },
];

/** Fonts offered in the typography dropdowns (all loaded in globals.css). */
export const FONT_OPTIONS: string[] = [
  "Inter",
  "Roboto",
  "Poppins",
  "Manrope",
  "DM Sans",
  "Playfair Display",
  "Cormorant Garamond",
];

/** Language toggles offered by the builder (native display names). */
export interface LanguageOption {
  code: string;
  name: string;
}
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },

];

/** Dummy menu the live preview renders so layout changes feel realistic. */
export interface PreviewMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

export const PREVIEW_MENU: PreviewMenuItem[] = [
  {
    id: "burger",
    name: "Smash Burger",
    description: "Double beef, aged cheddar, house sauce, brioche bun.",
    price: "$12.50",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  },
  {
    id: "salad",
    name: "Garden Salad",
    description: "Crisp greens, cherry tomato, cucumber, lemon vinaigrette.",
    price: "$8.00",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  },
  {
    id: "drink",
    name: "Fresh Lemonade",
    description: "Hand-pressed lemons, mint, a touch of honey.",
    price: "$4.50",
    imageUrl:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop",
  },
];
