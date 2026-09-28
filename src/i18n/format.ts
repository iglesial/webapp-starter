import { INTL_TAG, type Locale } from './locale';

// Locale-aware formatting. Pure functions taking an explicit locale so they
// work in tests and non-React code; components get them pre-bound via
// useLocale().

// The currency is a property of the price, not of the reader: pass the one
// you charge in and only the formatting follows the language
// ("€49.00" in English, "49,00 €" in French).
export const DEFAULT_CURRENCY = 'EUR';

export function formatPrice(
  cents: number,
  locale: Locale,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(INTL_TAG[locale], {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}
