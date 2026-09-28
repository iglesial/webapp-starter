import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleToggle } from './LocaleToggle';
import { LocaleContext } from '../../contexts/LocaleContext';
import i18n from '../../i18n/config';
import { DEFAULT_LOCALE, LOCALES, LOCALE_ENDONYM } from '../../i18n/locale';

const setLocale = vi.fn();

function renderToggle() {
  return render(
    <LocaleContext.Provider value={{ setLocale, saveState: 'idle' }}>
      <LocaleToggle />
    </LocaleContext.Provider>,
  );
}

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage(DEFAULT_LOCALE);
});

describe('LocaleToggle', () => {
  it('offers both languages, named in their own language', () => {
    renderToggle();

    expect(screen.getByRole('button', { name: 'Français' })).toHaveTextContent('FR');
    expect(screen.getByRole('button', { name: 'English' })).toHaveTextContent('EN');
  });

  it('marks the active language as pressed', () => {
    renderToggle();

    // The rendered language is whatever the suite is pinned to (DEFAULT_LOCALE),
    // so derive the expectation from it rather than naming one language.
    expect(
      screen.getByRole('button', { name: LOCALE_ENDONYM[DEFAULT_LOCALE] }),
    ).toHaveAttribute('aria-pressed', 'true');

    for (const other of LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)) {
      expect(screen.getByRole('button', { name: LOCALE_ENDONYM[other] })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    }
  });

  it('requests the chosen language', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole('button', { name: 'Français' }));

    expect(setLocale).toHaveBeenCalledWith('fr');
  });
});
