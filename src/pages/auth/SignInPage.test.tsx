import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue, AuthStatus } from '../../types/auth';
import { signInWithCredentials } from '../../services/authService';
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
        ? { sub: 's', email: 'a@b.co', displayName: 'A', emailVerified: true, groups: [] }
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
          <Route path="/library" element={<Landed />} />
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
  it('submits credentials and navigates to /library by default', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/library'));
  });

  it('navigates back to location.state.from after successful sign-in (FR-021)', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({ ok: true, value: undefined });
    renderPage({ initialState: { from: '/gameplay' } });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/gameplay'));
  });

  it('shows a generic alert on INVALID_CREDENTIALS (FR-009)', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({
      ok: false,
      code: 'INVALID_CREDENTIALS',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'ghost@b.co');
    await user.type(screen.getByLabelText(/password/i), 'x');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(screen.getByText(/sign-in failed/i)).toBeInTheDocument());
    expect(screen.queryByText(/unknown email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/wrong password/i)).not.toBeInTheDocument();
  });

  it('routes to /confirm on USER_NOT_CONFIRMED', async () => {
    vi.mocked(signInWithCredentials).mockResolvedValue({
      ok: false,
      code: 'USER_NOT_CONFIRMED',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/confirm|a@b.co'));
  });

  it('redirects an already-authenticated visitor to /library', () => {
    renderPage({ status: 'authenticated' });
    expect(screen.getByTestId('landed')).toHaveTextContent('/library');
  });

  it('redirects an already-authenticated visitor to the requested from-path', () => {
    renderPage({ status: 'authenticated', initialState: { from: '/gameplay' } });
    expect(screen.getByTestId('landed')).toHaveTextContent('/gameplay');
  });

  it('prefills email when arriving from confirm flow', () => {
    renderPage({ initialState: { justConfirmedEmail: 'a@b.co' } });
    expect(screen.getByLabelText(/email/i)).toHaveValue('a@b.co');
    expect(screen.getByText(/email verified/i)).toBeInTheDocument();
  });

  it('exposes a "Forgot password?" link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
