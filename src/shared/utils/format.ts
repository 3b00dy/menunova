/**
 * Currency-aware price formatter. IQD renders with 0 decimals; everything else
 * with 2. Falls back to "<value> <currency>" if Intl rejects the currency code.
 */
export function formatPrice(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IQD" ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

/** Combining diacritical marks (U+0300–U+036F), stripped after NFKD normalize. */
const DIACRITICS = /[̀-ͯ]/g;

/** URL-safe slug: lowercase, strip diacritics, non-alphanumerics → "-", trim, cap 48. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Short prefixed id, e.g. `id("item") → "item_k3f9a2b"`. */
export function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
