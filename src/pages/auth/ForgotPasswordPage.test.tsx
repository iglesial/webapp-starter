import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestPasswordReset } from '../../services/authService';
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
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await waitFor(() =>
      expect(screen.getByTestId('landed')).toHaveTextContent('/forgot-password/confirm|a@b.co'),
    );
  });

  it('navigates to the identical confirm screen for an unregistered email (also ok)', async () => {
    // authService.requestPasswordReset already rewrites UserNotFoundException → ok:true.
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'ghost@b.co');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await waitFor(() =>
      expect(screen.getByTestId('landed')).toHaveTextContent(
        '/forgot-password/confirm|ghost@b.co',
      ),
    );
  });

  it('surfaces RATE_LIMITED_TRY_LATER explicitly and does NOT navigate', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({
      ok: false,
      code: 'RATE_LIMITED_TRY_LATER',
    });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await waitFor(() => expect(screen.getByText(/too many attempts/i)).toBeInTheDocument());
    expect(screen.queryByTestId('landed')).not.toBeInTheDocument();
  });

  it('trims whitespace from the email before submitting', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true, value: undefined });
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), '  a@b.co  ');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));
    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith('a@b.co'));
  });
});
