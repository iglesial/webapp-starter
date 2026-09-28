import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isLocale, resolveLocale } from './locale';

describe('isLocale', () => {
  it('accepts supported locales only', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale('fr-FR')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe('resolveLocale', () => {
  it('prefers the account preference over everything else', () => {
    expect(resolveLocale({ cognito: 'en', stored: 'fr', navigator: ['fr-FR'] })).toBe('en');
  });

  it('falls back to this device when the account has no preference', () => {
    expect(resolveLocale({ cognito: null, stored: 'fr', navigator: ['en-GB'] })).toBe('fr');
  });

  it('matches the browser language by its primary subtag', () => {
    expect(resolveLocale({ navigator: ['fr-CA', 'en-US'] })).toBe('fr');
    expect(resolveLocale({ navigator: ['en-US'] })).toBe('en');
  });

  it('skips unsupported browser languages rather than stopping at the first', () => {
    expect(resolveLocale({ navigator: ['de-DE', 'es', 'fr-FR'] })).toBe('fr');
  });

  it('ignores unsupported stored or account values', () => {
    expect(resolveLocale({ cognito: 'de', stored: 'es', navigator: ['fr'] })).toBe('fr');
  });

  it('falls back to the default with no signals at all', () => {
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE);
  });
});
