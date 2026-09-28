import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, readStoredLocale, resolveLocale } from './locale';
import { fr } from './messages/fr';
import { en } from './messages/en';

// Both catalogs are bundled statically (no HTTP backend): two locales at a
// few kB each, and a synchronous init means no Suspense boundary and no
// loading flash. LocaleProvider owns changes from here on.
export const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveLocale({
    stored: readStoredLocale(),
    navigator: typeof navigator === 'undefined' ? [] : navigator.languages,
  }),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false, // React already escapes
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
