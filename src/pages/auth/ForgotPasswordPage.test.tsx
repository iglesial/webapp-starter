import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestPasswordReset } from '../../services/authService';
import { rx, rxIn } from '../../test/i18n';
import { ForgotPasswordPage } from './ForgotPasswordPage';

vi.mock('../../services/authService', () => ({
  requestPasswordReset: vi.fn(),
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/confirm" element={<Landed />} />
        <Route path="/signin" element={<Landed />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ForgotPasswordPage — FR-012 anti-enumeration', () => {
  it('navigates to /forgot-password/confirm for a registered email (ok result)', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'a@b.co');
    await user.click(screen.getByRole('button', { name: rx('auth.forgotPassword.submit') }));
    await waitFor(() =>
      expect(screen.getByTestId('landed')).toHaveTextContent('/forgot-password/confirm|a@b.co'),
    );
  });

  it('navigates to the identical confirm screen for an unregistered email (also ok)', async () => {
    // authService.requestPasswordReset already rewrites UserNotFoundException → ok:true.
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'ghost@b.co');
    await user.click(screen.getByRole('button', { name: rx('auth.forgotPassword.submit') }));
    await waitFor(() =>
      expect(screen.getByTestId('landed')).toHaveTextContent(
        '/forgot-password/confirm|ghost@b.co',
      ),
    );
    // FR-012: the exact wording IS the contract — nothing rendered may hint
    // that the address is unknown. Literal strings, not catalog lookups: a
    // lookup would compare the copy against itself and keep passing even if
    // someone reintroduced an enumeration-revealing message.
    expect(document.body.textContent).not.toMatch(
      /inconnu|introuvable|n’existe pas|aucun compte/i,
    );
    expect(document.body.textContent).not.toMatch(/unknown|not found|no account/i);
  });

  it('surfaces RATE_LIMITED_TRY_LATER explicitly and does NOT navigate', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({
      ok: false,
      code: 'RATE_LIMITED_TRY_LATER',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), 'a@b.co');
    await user.click(screen.getByRole('button', { name: rx('auth.forgotPassword.submit') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('errors.auth.forgotPassword.RATE_LIMITED_TRY_LATER.title'),
      ),
    );
    expect(screen.queryByTestId('landed')).not.toBeInTheDocument();
  });

  it('trims whitespace from the email before submitting', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.emailLabel')), '  a@b.co  ');
    await user.click(screen.getByRole('button', { name: rx('auth.forgotPassword.submit') }));
    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith('a@b.co'));
  });
});
