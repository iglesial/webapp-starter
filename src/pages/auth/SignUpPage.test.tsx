import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue, AuthStatus } from '../../types/auth';
import { signUpWithDisplayName } from '../../services/authService';
import { SignUpPage } from './SignUpPage';

vi.mock('../../services/authService', () => ({
  signUpWithDisplayName: vi.fn(),
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

function renderPage(status: AuthStatus = 'unauthenticated') {
  return render(
    <AuthContext.Provider value={makeCtx(status)}>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/confirm" element={<Landed />} />
          <Route path="/signin" element={<Landed />} />
          <Route path="/forgot-password" element={<Landed />} />
          <Route path="/library" element={<Landed />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function fillForm(name = 'Alice', email = 'a@b.co', password = 'Passw0rd!!') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.type(screen.getByLabelText(/display name/i), name);
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SignUpPage', () => {
  it('redirects an already-authenticated visitor to /library', () => {
    renderPage('authenticated');
    expect(screen.getByTestId('landed')).toHaveTextContent('/library');
  });

  it('submits valid credentials and routes to /confirm with email in state', async () => {
    vi.mocked(signUpWithDisplayName).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/confirm|a@b.co'));
    expect(signUpWithDisplayName).toHaveBeenCalledWith({
      email: 'a@b.co',
      password: 'Passw0rd!!',
      displayName: 'Alice',
    });
  });

  it('blocks submit and shows per-field error for a 2-char display name (FR-016)', async () => {
    renderPage();
    const user = await fillForm('ab');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(signUpWithDisplayName).not.toHaveBeenCalled();
  });

  it('shows a top-level alert for EMAIL_ALREADY_REGISTERED and offers links (FR-004)', async () => {
    vi.mocked(signUpWithDisplayName).mockResolvedValue({
      ok: false,
      code: 'EMAIL_ALREADY_REGISTERED',
    });
    renderPage();
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: /create account/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/already registered/i);
    expect(alert.querySelector('a[href="/signin"]')).not.toBeNull();
    expect(alert.querySelector('a[href="/forgot-password"]')).not.toBeNull();
  });

  it('surfaces the password-policy rules as hint text', () => {
    renderPage();
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it('maps PASSWORD_DOES_NOT_MEET_POLICY to a top alert', async () => {
    vi.mocked(signUpWithDisplayName).mockResolvedValue({
      ok: false,
      code: 'PASSWORD_DOES_NOT_MEET_POLICY',
    });
    renderPage();
    const user = await fillForm('Alice', 'a@b.co', 'weak');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText(/too weak/i)).toBeInTheDocument());
  });

  it('trims the email before submitting', async () => {
    vi.mocked(signUpWithDisplayName).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), '  a@b.co  ');
    await user.type(screen.getByLabelText(/password/i), 'Passw0rd!!');
    await user.type(screen.getByLabelText(/display name/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() =>
      expect(signUpWithDisplayName).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'a@b.co' }),
      ),
    );
  });
});
