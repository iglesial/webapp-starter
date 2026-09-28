import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleContext } from '../contexts/LocaleContext';
import { formatDateTime, formatPrice } from '../i18n/format';
import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/locale';

interface UseLocale {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  saveState: 'idle' | 'saved' | 'failed';
  // Formatters pre-bound to the active locale.
  formatPrice: (cents: number, currency?: string) => string;
  formatDateTime: (iso: string) => string;
}

export function useLocale(): UseLocale {
  const { i18n } = useTranslation();
  const { setLocale, saveState } = useContext(LocaleContext);
  const locale = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;

  // Memoized so the bound formatters keep a stable identity across renders —
  // callers put them in useCallback/useEffect dependency arrays.
  return useMemo(
    () => ({
      locale,
      setLocale,
      saveState,
      formatPrice: (cents: number, currency?: string) => formatPrice(cents, locale, currency),
      formatDateTime: (iso: string) => formatDateTime(iso, locale),
    }),
    [locale, setLocale, saveState],
  );
}
