import { useTranslation } from 'react-i18next';
import { useLocale } from '../../hooks/useLocale';
import { LOCALES, LOCALE_ENDONYM } from '../../i18n/locale';
import './LocaleToggle.css';

// Segmented FR/EN control. The visible label is the short code; the
// endonym (each language named in itself) is the accessible name — never
// translated, so a lost French speaker can always find "Français".
export function LocaleToggle() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <div className="locale-toggle" role="group" aria-label={t('nav.language')}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          className="locale-toggle-option"
          aria-pressed={option === locale}
          aria-label={LOCALE_ENDONYM[option]}
          onClick={() => setLocale(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
