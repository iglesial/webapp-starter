import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue, AuthStatus } from '../../types/auth';
import { signInWithCredentials } from '../../services/authService';
import { rx, rxIn } from '../../test/i18n';
import { SignInPage } from './SignInPage';

vi.mock('../../services/authService', () => ({
  signInWithCredentials: vi.fn(),
}));

function Landed() {
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  return (
    <div data-testid="landed">
      {location.pathname}|{state?.email ?? 'none'}
    </div>
  );
}

function makeCtx(status: AuthStatus): AuthContextValue {
  return {
    status,
    user:
      status === 'authenticated'
        ? { sub: 's', email: 'a@b.co', displayName: 'A', emailVerified: true, locale: null, groups: [] }
        : null,
    isAdmin: false,
    signOut: async () => {},
    refreshUser: async () => {},
  };
}

function renderPage(
  options: {
    initialPath?: string;
    initialState?: { from?: string; justConfirmedEmail?: string };
    status?: AuthStatus;
  } = {},
) {
  const { initialPath = '/signin', initialState, status = 'unauthenticated' } = options;
  return render(
    <AuthContext.Provider value={makeCtx(status)}>
      <MemoryRouter initialEntries={[{ pathname: initialPath, state: initialState }]}>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/profile" element={<Landed />} />
          <Route path="/gameplay" element={<Landed />} />
          <Route path="/confirm" element={<Landed />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SignInPage', () => {
  it('submits credentials and navigates to /profile by default', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'a@b.co');
    await user.type(screen.getByLabelText(rxIn('auth.passwordLabel')), 'pw');
    await user.click(screen.getByRole('button', { name: rx('auth.signIn.submit') }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/profile'));
  });

  it('navigates back to location.state.from after successful sign-in (FR-021)', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({ ok: true, value: undefined });
    renderPage({ initialState: { from: '/gameplay' } });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'a@b.co');
    await user.type(screen.getByLabelText(rxIn('auth.passwordLabel')), 'pw');
    await user.click(screen.getByRole('button', { name: rx('auth.signIn.submit') }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/gameplay'));
  });

  it('shows a generic alert on INVALID_CREDENTIALS (FR-009)', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({
      ok: false,
      code: 'INVALID_CREDENTIALS',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'ghost@b.co');
    await user.type(screen.getByLabelText(rxIn('auth.passwordLabel')), 'x');
    await user.click(screen.getByRole('button', { name: rx('auth.signIn.submit') }));

    // FR-009: an unknown email and a wrong password must be
    // indistinguishable. authService maps both exceptions to this one code
    // (asserted in authService.test.ts), so what this test enforces is the
    // other half: the rendered message must not name which factor failed.
    // The negative matchers are literal, and cover BOTH languages — a
    // catalog lookup would compare the copy against itself and keep passing
    // even if someone reintroduced a revealing message.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(rxIn('errors.auth.signIn.INVALID_CREDENTIALS.title'));
    expect(alert.textContent).not.toMatch(/inconnu|introuvable|n’existe pas|incorrect/i);
    expect(alert.textContent).not.toMatch(/unknown email|no such account|wrong password/i);
  });

  it('routes to /confirm on USER_NOT_CONFIRMED', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({
      ok: false,
      code: 'USER_NOT_CONFIRMED',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'a@b.co');
    await user.type(screen.getByLabelText(rxIn('auth.passwordLabel')), 'pw');
    await user.click(screen.getByRole('button', { name: rx('auth.signIn.submit') }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/confirm|a@b.co'));
  });

  it('redirects an already-authenticated visitor to /profile', () => {
    renderPage({ status: 'authenticated' });
    expect(screen.getByTestId('landed')).toHaveTextContent('/profile');
  });

  it('redirects an already-authenticated visitor to the requested from-path', () => {
    renderPage({ status: 'authenticated', initialState: { from: '/gameplay' } });
    expect(screen.getByTestId('landed')).toHaveTextContent('/gameplay');
  });

  it('prefills email when arriving from confirm flow', () => {
    renderPage({ initialState: { justConfirmedEmail: 'a@b.co' } });
    expect(screen.getByLabelText(rxIn('auth.emailLabel'))).toHaveValue('a@b.co');
    expect(screen.getByRole('alert')).toHaveTextContent(rxIn('auth.signIn.emailVerifiedTitle'));
  });

  it('exposes a "Forgot password?" link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: rx('auth.signIn.forgotPassword') })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
