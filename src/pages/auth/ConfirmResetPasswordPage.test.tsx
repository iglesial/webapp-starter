import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmPasswordReset } from '../../services/authService';
import { rx, rxIn } from '../../test/i18n';
import { ConfirmResetPasswordPage } from './ConfirmResetPasswordPage';

vi.mock('../../services/authService', () => ({
  confirmPasswordReset: vi.fn(),
}));

function Landed() {
  const location = useLocation();
  const state = location.state as { justResetEmail?: string } | null;
  return (
    <div data-testid="landed">
      {location.pathname}|{state?.justResetEmail ?? 'none'}
    </div>
  );
}

function renderPage(options: { withEmail?: boolean } = { withEmail: true }) {
  const entry = options.withEmail
    ? { pathname: '/forgot-password/confirm', state: { email: 'a@b.co' } }
    : { pathname: '/forgot-password/confirm' };
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/forgot-password/confirm" element={<ConfirmResetPasswordPage />} />
        <Route path="/forgot-password" element={<Landed />} />
        <Route path="/signin" element={<Landed />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConfirmResetPasswordPage', () => {
  it('redirects to /forgot-password when no email state is present', () => {
    renderPage({ withEmail: false });
    expect(screen.getByTestId('landed')).toHaveTextContent('/forgot-password');
  });

  it('submits and navigates to /signin on success', async () => {
    vi.mocked(confirmPasswordReset).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.codeLabel')), '123456');
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.newPasswordLabel')), 'Passw0rd!!');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmReset.submit') }));
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/signin|a@b.co'));
    expect(confirmPasswordReset).toHaveBeenCalledWith('a@b.co', '123456', 'Passw0rd!!');
  });

  it('shows expired-code alert with a request-new-code link', async () => {
    vi.mocked(confirmPasswordReset).mockResolvedValue({
      ok: false,
      code: 'VERIFICATION_CODE_EXPIRED',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.codeLabel')), 'old');
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.newPasswordLabel')), 'Passw0rd!!');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmReset.submit') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('errors.auth.confirmReset.VERIFICATION_CODE_EXPIRED.title'),
      ),
    );
    expect(
      screen.getByRole('link', { name: rx('auth.confirmReset.requestNewCode') }),
    ).toHaveAttribute('href', '/forgot-password');
  });

  it('shows invalid-code alert on VERIFICATION_CODE_INVALID', async () => {
    vi.mocked(confirmPasswordReset).mockResolvedValue({
      ok: false,
      code: 'VERIFICATION_CODE_INVALID',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.codeLabel')), 'bad');
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.newPasswordLabel')), 'Passw0rd!!');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmReset.submit') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('errors.auth.confirmReset.VERIFICATION_CODE_INVALID.title'),
      ),
    );
  });

  it('shows weak-password alert on PASSWORD_DOES_NOT_MEET_POLICY', async () => {
    vi.mocked(confirmPasswordReset).mockResolvedValue({
      ok: false,
      code: 'PASSWORD_DOES_NOT_MEET_POLICY',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.codeLabel')), '123456');
    await user.type(screen.getByLabelText(rxIn('auth.confirmReset.newPasswordLabel')), 'weak');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmReset.submit') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('errors.auth.confirmReset.PASSWORD_DOES_NOT_MEET_POLICY.title'),
      ),
    );
  });
});
