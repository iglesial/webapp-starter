import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LocaleContext, type LocaleContextValue } from './LocaleContext';
import { useAuth } from '../hooks/useAuth';
import { updateLocale as persistLocale } from '../services/authService';
import i18n from '../i18n/config';
import { isLocale, writeStoredLocale, type Locale } from '../i18n/locale';

// i18next owns the active language (initialized in src/i18n/config.ts from
// localStorage + navigator). This provider owns the rules i18next can't know
// about: the signed-in user's saved preference wins, and every change is
// persisted to both this device and the account.
//
// It deliberately uses the i18next singleton rather than useTranslation():
// the hook returns a fresh `i18n` identity on every render, which as an
// effect dependency would re-assert the account's (stale) locale after each
// re-render and silently undo the user's switch.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [saveState, setSaveState] = useState<LocaleContextValue['saveState']>('idle');

  const setLocale = useCallback(
    (next: Locale) => {
      // Optimistic: the UI switches immediately and stays switched even if
      // the account write fails — reverting the language under the user
      // would be worse than a preference that didn't sync.
      void i18n.changeLanguage(next);
      writeStoredLocale(next);
      if (status === 'authenticated') {
        setSaveState('idle');
        void persistLocale(next).then((result) => setSaveState(result.ok ? 'saved' : 'failed'));
      }
    },
    [status],
  );

  // Applied account preferences, so a re-render never re-imposes a value the
  // user has since changed.
  const appliedRef = useRef<string | null>(null);
  const accountLocale = user?.locale ?? null;

  useEffect(() => {
    if (status !== 'authenticated') return;
    const key = `${user?.sub ?? ''}:${accountLocale ?? ''}`;
    if (appliedRef.current === key) return;
    appliedRef.current = key;

    if (isLocale(accountLocale)) {
      // The account's choice follows the user across devices.
      if (accountLocale !== i18n.language) void i18n.changeLanguage(accountLocale);
      writeStoredLocale(accountLocale);
      return;
    }
    // No saved preference yet (pre-existing users, or someone who chose a
    // language before signing up): back-fill what they're currently using.
    if (isLocale(i18n.language)) void persistLocale(i18n.language);
  }, [status, accountLocale, user?.sub]);

  useEffect(() => {
    const sync = (lng: string) => {
      document.documentElement.lang = lng;
    };
    sync(i18n.language);
    i18n.on('languageChanged', sync);
    return () => i18n.off('languageChanged', sync);
  }, []);

  const value = useMemo(() => ({ setLocale, saveState }), [setLocale, saveState]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
