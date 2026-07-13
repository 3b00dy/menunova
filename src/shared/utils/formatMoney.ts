import type { Locale } from "@/shared/i18n/config";

/** A money amount stored in minor units (e.g. cents/halalas) plus an ISO currency code. */
export interface Money {
  /** Amount in the currency's minor unit (integer). */
  amountMinor: number;
  /** ISO 4217 code, e.g. "SAR", "USD". */
  currency: string;
}

/** Format a {@link Money} value for a given locale using Intl. */
export function formatMoney(money: Money, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(money.amountMinor / 100);
}
