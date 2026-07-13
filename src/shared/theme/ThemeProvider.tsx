"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { RestaurantTheme } from "@/shared/theme/types";

/**
 * Runtime theming engine. Maps a {@link RestaurantTheme}'s semantic radius/shadow
 * choices to CSS values and writes ALL theme variables onto either
 * `document.documentElement` (global) or a wrapping div (scoped — used by the
 * Theme Builder live preview so a pane themes independently of the page).
 *
 * Ported from the source app to Next.js: DOM writes run in `useEffect` so they
 * only execute on the client after hydration.
 */

const RADIUS_MAP: Record<RestaurantTheme["components"]["borderRadius"], string> = {
  sm: "6px",
  md: "12px",
  lg: "20px",
  pill: "9999px",
};

const SHADOW_MAP: Record<RestaurantTheme["components"]["shadow"], string> = {
  none: "none",
  soft: "0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)",
  pronounced: "0 12px 40px rgba(0, 0, 0, 0.18)",
};

/** Resolve the active radius/shadow for a theme — reused for SSR seeding. */
export function activeRadius(theme: RestaurantTheme): string {
  return RADIUS_MAP[theme.components.borderRadius];
}
export function activeShadow(theme: RestaurantTheme): string {
  return SHADOW_MAP[theme.components.shadow];
}

export function applyThemeToElement(theme: RestaurantTheme, el: HTMLElement): void {
  const { colors, typography, components } = theme;
  el.style.setProperty("--color-primary", colors.primary);
  el.style.setProperty("--color-primary-fg", colors.primaryFg);
  el.style.setProperty("--color-secondary", colors.secondary);
  el.style.setProperty("--color-accent", colors.accent);
  el.style.setProperty("--color-bg", colors.background);
  el.style.setProperty("--color-surface", colors.surface);
  el.style.setProperty("--color-text", colors.text);
  el.style.setProperty("--color-muted", colors.muted);
  el.style.setProperty("--color-border", colors.border);
  el.style.setProperty("--radius-active", RADIUS_MAP[components.borderRadius]);
  el.style.setProperty("--shadow-active", SHADOW_MAP[components.shadow]);
  el.style.setProperty("--font-body", typography.fontFamily);
  el.style.setProperty("--font-heading", typography.headingFamily);
}

interface ThemeContextValue {
  theme: RestaurantTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export interface ThemeProviderProps {
  theme: RestaurantTheme;
  children: ReactNode;
  /** Scope variables to a wrapping div instead of the document root. */
  scoped?: boolean;
}

export function ThemeProvider({ theme, children, scoped = false }: ThemeProviderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scoped) {
      if (ref.current) applyThemeToElement(theme, ref.current);
      return;
    }
    const root = document.documentElement;
    applyThemeToElement(theme, root);
    root.dir = theme.direction;
    return () => {
      root.dir = "ltr";
    };
  }, [theme, scoped]);

  if (scoped) {
    return (
      <ThemeContext.Provider value={{ theme }}>
        <div
          ref={ref}
          dir={theme.direction}
          style={{
            fontFamily: theme.typography.fontFamily,
            color: `rgb(${theme.colors.text})`,
            backgroundColor: `rgb(${theme.colors.background})`,
          }}
        >
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}
