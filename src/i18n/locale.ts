// Locale primitives — pure, zero React and zero i18next imports so the
// resolution rules stay unit-testable and usable from services.

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

// The rendered default for visitors with no stored preference and no
// matching browser language. Change this one constant to make French (or any
// other entry of LOCALES) the default — nothing else depends on it.
export const DEFAULT_LOCALE: Locale = 'en';

// BCP 47 tags for Intl formatters (the catalog keys stay short).
export const INTL_TAG: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };

// Language names are endonyms — shown in their own language, never translated.
export const LOCALE_ENDONYM: Record<Locale, string> = { fr: 'Français', en: 'English' };

// localStorage, not sessionStorage: a language
// choice is a user-set functional preference that should survive tab close,
// and functional storage is consent-exempt under ePrivacy — no banner needed.
export const LOCALE_STORAGE_KEY = 'app.locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export interface LocaleSources {
  cognito?: string | null;
  stored?: string | null;
  navigator?: readonly string[];
}

// Resolution order: the account's saved preference wins, then this device's,
// then what the browser asks for, then the default.
//
// Deliberate: the browser's language ranks ABOVE the default, so a
// French-language browser lands on French even when the default is English.
// Visitors can always override with the toggle, and the choice is remembered.
export function resolveLocale({ cognito, stored, navigator }: LocaleSources): Locale {
  if (isLocale(cognito)) return cognito;
  if (isLocale(stored)) return stored;
  for (const tag of navigator ?? []) {
    const primary = tag.split('-')[0]?.toLowerCase();
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}

export function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null; // storage disabled — fall through to the other sources
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage unavailable: the choice simply doesn't persist.
  }
}
