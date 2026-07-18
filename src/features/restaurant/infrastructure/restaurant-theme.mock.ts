import { DEFAULT_THEME_CONFIG, type ThemeConfig } from "@/shared/theme/tenant-config";
import type { RestaurantThemeRepository } from "@/features/restaurant/domain/restaurant-theme.ports";

/**
 * In-memory restaurant themes for demo & local dev. Persists within a running
 * server process (resets on restart). Seeded with a distinct design per seeded
 * tenant so each restaurant's public menu looks different out of the box; the
 * Theme Builder overwrites the entry for a slug when an admin saves.
 *
 * Swap for the HTTP repository once the backend exposes a theme endpoint (see
 * docs/missed-endpoints.md).
 */

const theme = (over: Partial<ThemeConfig> & Pick<ThemeConfig, "brandColors" | "typography" | "components">): ThemeConfig => ({
  brandAssets: { logoUrl: "", coverImageUrl: "" },
  languages: { default: "en", supported: ["en", "ar"] },
  ...over,
});

const SEED: Record<string, ThemeConfig> = {
  demo: theme({
    brandColors: { background: "#ffffff", primary: "#ea580c", secondary: "#4b5563", text: "#1f2937" },
    typography: { headingFont: "Poppins", bodyFont: "Inter" },
    components: { layout: "nav", borderRadius: "lg", shadow: "md", buttonStyle: "solid" },
  }),
  "sakura-sushi": theme({
    brandColors: { background: "#faf7f2", primary: "#b91c1c", secondary: "#57534e", text: "#1c1917" },
    typography: { headingFont: "Playfair Display", bodyFont: "Lora" },
    components: { layout: "sidebar", borderRadius: "sm", shadow: "sm", buttonStyle: "outline" },
  }),
  "smash-house": theme({
    brandColors: { background: "#0a0a0a", primary: "#facc15", secondary: "#a3a3a3", text: "#fafafa" },
    typography: { headingFont: "Oswald", bodyFont: "Roboto" },
    components: { layout: "nav", borderRadius: "none", shadow: "lg", buttonStyle: "solid" },
  }),
  "amwaj-cafe": theme({
    brandColors: { background: "#f0fdfa", primary: "#0d9488", secondary: "#475569", text: "#134e4a" },
    typography: { headingFont: "Quicksand", bodyFont: "Nunito" },
    components: { layout: "categories", borderRadius: "full", shadow: "sm", buttonStyle: "outline" },
  }),
  "najd-grill": theme({
    brandColors: { background: "#fffbeb", primary: "#166534", secondary: "#78716c", text: "#1c1917" },
    typography: { headingFont: "Merriweather", bodyFont: "Cairo" },
    components: { layout: "categories", borderRadius: "md", shadow: "md", buttonStyle: "solid" },
  }),
};

const STORE = new Map<string, ThemeConfig>(Object.entries(SEED));

const clone = (t: ThemeConfig): ThemeConfig => JSON.parse(JSON.stringify(t)) as ThemeConfig;

export const restaurantThemeMockRepository: RestaurantThemeRepository = {
  async get(slug: string) {
    const found = STORE.get(slug);
    return found ? clone(found) : null;
  },
  async save(slug, themeConfig) {
    STORE.set(slug, clone(themeConfig));
  },
};

/** Fallback used by the query use-case when a restaurant has no saved theme. */
export { DEFAULT_THEME_CONFIG };
