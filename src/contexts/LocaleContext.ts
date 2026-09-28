import { createContext } from 'react';
import type { Locale } from '../i18n/locale';

export interface LocaleContextValue {
  setLocale: (locale: Locale) => void;
  // Last Cognito persistence outcome, so ProfilePage can confirm or warn.
  saveState: 'idle' | 'saved' | 'failed';
}

// Defaults to a no-op rather than throwing without a provider, so components
// render in isolated tests without a wrapper (same reasoning as
// PartnerDiscountContext). The active language itself comes from i18next.
export const LocaleContext = createContext<LocaleContextValue>({
  setLocale: () => {},
  saveState: 'idle',
});
