import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  confirmSignUpWithCode,
  resendConfirmationCode,
} from '../../services/authService';
import { rx, rxIn } from '../../test/i18n';
import { ConfirmSignUpPage } from './ConfirmSignUpPage';

vi.mock('../../services/authService', () => ({
  confirmSignUpWithCode: vi.fn(),
  resendConfirmationCode: vi.fn(),
}));

function Landed() {
  const location = useLocation();
  const state = location.state as { justConfirmedEmail?: string } | null;
  return (
    <div data-testid="landed">
      {location.pathname}|{state?.justConfirmedEmail ?? 'none'}
    </div>
  );
}

function renderPage(options: { withEmail?: boolean } = { withEmail: true }) {
  const initialEntry = options.withEmail
    ? { pathname: '/confirm', state: { email: 'a@b.co' } }
    : { pathname: '/confirm' };
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/confirm" element={<ConfirmSignUpPage />} />
        <Route path="/signin" element={<Landed />} />
        <Route path="/signup" element={<Landed />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConfirmSignUpPage', () => {
  it('redirects to /signup when no email state is present', () => {
    renderPage({ withEmail: false });
    expect(screen.getByTestId('landed')).toHaveTextContent('/signup|none');
  });

  it('shows the email being confirmed', () => {
    renderPage();
    expect(screen.getByText('a@b.co')).toBeInTheDocument();
  });

  it('submits code and navigates to /signin on success', async () => {
    vi.mocked(confirmSignUpWithCode).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmSignUp.codeLabel')), '123456');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmSignUp.submit') }));
    await waitFor(() =>
      expect(screen.getByTestId('landed')).toHaveTextContent('/signin|a@b.co'),
    );
    expect(confirmSignUpWithCode).toHaveBeenCalledWith('a@b.co', '123456');
  });

  it('shows an invalid-code alert on VERIFICATION_CODE_INVALID', async () => {
    vi.mocked(confirmSignUpWithCode).mockResolvedValue({
      ok: false,
      code: 'VERIFICATION_CODE_INVALID',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmSignUp.codeLabel')), 'wrong');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmSignUp.submit') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('errors.auth.confirmSignUp.VERIFICATION_CODE_INVALID.title'),
      ),
    );
  });

  it('shows an expired-code alert on VERIFICATION_CODE_EXPIRED', async () => {
    vi.mocked(confirmSignUpWithCode).mockResolvedValue({
      ok: false,
      code: 'VERIFICATION_CODE_EXPIRED',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(rxIn('auth.confirmSignUp.codeLabel')), 'old');
    await user.click(screen.getByRole('button', { name: rx('auth.confirmSignUp.submit') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('errors.auth.confirmSignUp.VERIFICATION_CODE_EXPIRED.title'),
      ),
    );
  });

  it('calls resendConfirmationCode and shows a success alert on resend', async () => {
    vi.mocked(resendConfirmationCode).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: rx('auth.confirmSignUp.resend') }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        rxIn('auth.confirmSignUp.resentBody'),
      ),
    );
    expect(resendConfirmationCode).toHaveBeenCalledWith('a@b.co');
  });
});
