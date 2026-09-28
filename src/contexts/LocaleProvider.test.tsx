import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleProvider } from './LocaleProvider';
import { LocaleContext } from './LocaleContext';
import { AuthContext } from './AuthContext';
import type { AuthContextValue, AuthUser } from '../types/auth';
import { updateLocale } from '../services/authService';
import i18n from '../i18n/config';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from '../i18n/locale';

vi.mock('../services/authService', () => ({
  updateLocale: vi.fn(async () => ({ ok: true, value: undefined })),
}));

const updateLocaleMock = vi.mocked(updateLocale);

function makeUser(locale: Locale | null): AuthUser {
  return {
    sub: 'u1',
    email: 'u@test.com',
    displayName: 'Alice',
    emailVerified: true,
    locale,
    groups: [],
  };
}

function makeAuth(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    status: 'unauthenticated',
    user: null,
    isAdmin: false,
    signOut: vi.fn(async () => {}),
    refreshUser: vi.fn(async () => {}),
    ...overrides,
  };
}

function Probe() {
  const { setLocale, saveState } = useContext(LocaleContext);
  // Subscribes to language changes the way real components do.
  const { i18n: active } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{active.language}</span>
      <span data-testid="save">{saveState}</span>
      <button type="button" onClick={() => setLocale('fr')}>
        to french
      </button>
    </div>
  );
}

function renderProvider(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <LocaleProvider>
        <Probe />
      </LocaleProvider>
    </AuthContext.Provider>,
  );
}

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  await i18n.changeLanguage(DEFAULT_LOCALE);
});

afterEach(async () => {
  await i18n.changeLanguage(DEFAULT_LOCALE);
});

describe('LocaleProvider', () => {
  it('switches the language and remembers it on this device', async () => {
    const user = userEvent.setup();
    renderProvider(makeAuth({}));

    await user.click(screen.getByRole('button', { name: /to french/i }));

    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('fr'));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    // Anonymous visitors have no account to save to.
    expect(updateLocaleMock).not.toHaveBeenCalled();
  });

  it('saves the choice to the account when signed in', async () => {
    const user = userEvent.setup();
    renderProvider(makeAuth({ status: 'authenticated', user: makeUser('en') }));

    await user.click(screen.getByRole('button', { name: /to french/i }));

    await waitFor(() => expect(updateLocaleMock).toHaveBeenCalledWith('fr'));
    await waitFor(() => expect(screen.getByTestId('save')).toHaveTextContent('saved'));
  });

  it('keeps the switch and reports failure when the account save fails', async () => {
    updateLocaleMock.mockResolvedValueOnce({ ok: false, code: 'NETWORK_ERROR' });
    const user = userEvent.setup();
    renderProvider(makeAuth({ status: 'authenticated', user: makeUser('en') }));

    await user.click(screen.getByRole('button', { name: /to french/i }));

    await waitFor(() => expect(screen.getByTestId('save')).toHaveTextContent('failed'));
    // The language switch stands even though the account write failed.
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('fr'));
  });

  it("applies the account's saved language on sign-in", async () => {
    renderProvider(makeAuth({ status: 'authenticated', user: makeUser('fr') }));

    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('fr'));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
  });

  it('back-fills the account when the user has no saved language yet', async () => {
    renderProvider(makeAuth({ status: 'authenticated', user: makeUser(null) }));

    await waitFor(() => expect(updateLocaleMock).toHaveBeenCalledWith(DEFAULT_LOCALE));
  });

  it('does not re-impose the account language after an unrelated re-render', async () => {
    const user = userEvent.setup();
    // The account still says 'en' (the AuthUser is not refreshed on switch);
    // a later re-render must not undo the user's choice.
    const { rerender } = renderProvider(
      makeAuth({ status: 'authenticated', user: makeUser('en') }),
    );

    await user.click(screen.getByRole('button', { name: /to french/i }));
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('fr'));

    rerender(
      <AuthContext.Provider value={makeAuth({ status: 'authenticated', user: makeUser('en') })}>
        <LocaleProvider>
          <Probe />
        </LocaleProvider>
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('lang')).toHaveTextContent('fr');
  });

  it('reflects the language on the document element', async () => {
    const user = userEvent.setup();
    renderProvider(makeAuth({}));

    await user.click(screen.getByRole('button', { name: /to french/i }));

    await waitFor(() => expect(document.documentElement.lang).toBe('fr'));
  });
});
