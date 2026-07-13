import type { ReactNode } from "react";
import { dir, type Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/getDictionary";
import { I18nProvider } from "@/shared/i18n/I18nProvider";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import { defaultTheme } from "@/shared/theme/adminTheme";

/**
 * Composition point for all app-wide client providers.
 *
 * Applies the default MenuNova brand theme globally (direction follows the
 * active locale) and provides the server-loaded i18n dictionary. Tenant/admin
 * surfaces can wrap subtrees in their own `ThemeProvider` to override.
 */
export function AppProviders({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <ThemeProvider theme={defaultTheme(dir(locale))}>
      <I18nProvider locale={locale} dictionary={dictionary}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
