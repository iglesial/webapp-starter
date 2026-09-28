import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { LocaleProvider } from '../../contexts/LocaleProvider';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue } from '../../types/auth';
import i18n from '../../i18n/config';
import { DEFAULT_LOCALE, LOCALE_ENDONYM, LOCALE_STORAGE_KEY } from '../../i18n/locale';
import { rx } from '../../test/i18n';

vi.mock('../../services/authService', () => ({
  updateLocale: vi.fn(async () => ({ ok: true, value: undefined })),
}));

function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    status: 'unauthenticated',
    user: null,
    isAdmin: false,
    signOut: vi.fn(async () => {}),
    refreshUser: vi.fn(async () => {}),
    ...overrides,
  };
}

function renderNavbar(auth = makeAuth()) {
  return render(
    <AuthContext.Provider value={auth}>
      <LocaleProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </LocaleProvider>
    </AuthContext.Provider>,
  );
}

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage(DEFAULT_LOCALE);
});

describe('Navbar — language switching', () => {
  it('offers the toggle to signed-out visitors', () => {
    renderNavbar();
    expect(screen.getByRole('group', { name: rx('nav.language') })).toBeInTheDocument();
  });

  it('offers the toggle to signed-in users too', () => {
    renderNavbar(
      makeAuth({
        status: 'authenticated',
        user: {
          sub: 'u1',
          email: 'a@b.co',
          displayName: 'Alice',
          emailVerified: true,
          locale: DEFAULT_LOCALE,
          groups: [],
        },
      }),
    );
    expect(screen.getByRole('group', { name: rx('nav.language') })).toBeInTheDocument();
  });

  it('switches the visible navigation copy and remembers the choice', async () => {
    const user = userEvent.setup();
    renderNavbar();

    // Rendered in the default language to begin with.
    expect(screen.getByRole('link', { name: rx('nav.signIn') })).toBeInTheDocument();

    const other = DEFAULT_LOCALE === 'fr' ? 'en' : 'fr';
    await user.click(screen.getByRole('button', { name: LOCALE_ENDONYM[other] }));

    await waitFor(() => expect(i18n.language).toBe(other));
    // The link is still there, now labelled in the other language.
    expect(screen.getByRole('link', { name: rx('nav.signIn') })).toBeInTheDocument();
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(other);
  });
});
