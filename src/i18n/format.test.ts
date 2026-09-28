import { describe, expect, it } from 'vitest';
import { formatDateTime, formatPrice } from './format';

// Intl emits a narrow no-break space (U+202F) or NBSP (U+00A0) around
// French separators depending on the ICU version bundled with Node — assert
// against normalized whitespace so the tests don't drift with the runtime.
const norm = (value: string) => value.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('formats euros the English way', () => {
    expect(norm(formatPrice(4900, 'en'))).toBe('€49.00');
  });

  it('formats euros the French way (comma decimal, trailing symbol)', () => {
    expect(norm(formatPrice(4900, 'fr'))).toBe('49,00 €');
  });

  it('formats larger amounts', () => {
    expect(norm(formatPrice(49900, 'en'))).toBe('€499.00');
    expect(norm(formatPrice(49900, 'fr'))).toBe('499,00 €');
  });

  it('keeps cents precision', () => {
    expect(norm(formatPrice(3920, 'fr'))).toBe('39,20 €');
    expect(norm(formatPrice(0, 'en'))).toBe('€0.00');
  });

  it("formats the currency it is given, in the reader's conventions", () => {
    expect(norm(formatPrice(4900, 'en', 'USD'))).toBe('US$49.00');
    expect(norm(formatPrice(4900, 'fr', 'USD'))).toBe('49,00 $US');
  });
});

describe('formatDateTime', () => {
  const iso = '2026-09-05T14:30:00Z';

  it('renders a localized date in each language', () => {
    const fr = formatDateTime(iso, 'fr');
    const en = formatDateTime(iso, 'en');
    expect(fr).toMatch(/septembre/);
    expect(en).toMatch(/September/);
    expect(fr).not.toBe(en);
  });
});
