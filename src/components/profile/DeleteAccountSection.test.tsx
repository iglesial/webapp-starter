import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue, AuthUser } from '../../types/auth';
import { DeleteAccountSection } from './DeleteAccountSection';
import { accountService } from '../../services/data/accountService';
import { rx, tt } from '../../test/i18n';

vi.mock('../../services/data/accountService', () => ({
  accountService: { deleteMyAccount: vi.fn() },
}));

const payments = vi.hoisted(() => ({ enabled: false }));
vi.mock('../../modules/payments/enabled', () => ({ isPaymentsEnabled: () => payments.enabled }));

const deleteMock = vi.mocked(accountService.deleteMyAccount);

const alice: AuthUser = {
  sub: 'sub-alice',
  email: 'alice@b.co',
  displayName: 'Alice',
  emailVerified: true,
  locale: null,
  groups: [],
};

function Landed() {
  const location = useLocation();
  return (
    <div data-testid="landed">
      {location.pathname}
      {(location.state as { accountDeleted?: boolean } | null)?.accountDeleted ? ' deleted' : ''}
    </div>
  );
}

function renderSection(signOut = vi.fn(async () => {})) {
  const ctx: AuthContextValue = {
    status: 'authenticated',
    user: alice,
    isAdmin: false,
    signOut,
    refreshUser: vi.fn(async () => {}),
  };
  render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<DeleteAccountSection />} />
          <Route path="/" element={<Landed />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return { signOut };
}

beforeEach(() => {
  vi.clearAllMocks();
  payments.enabled = false;
});

async function confirmAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: rx('account.open') }));
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: rx('account.submit') }));
}

describe('DeleteAccountSection', () => {
  // Irreversible: nothing may be deletable before the user has read what is
  // erased AND ticked the confirmation.
  it('keeps the delete button disabled until the confirmation is ticked', async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole('button', { name: rx('account.open') }));

    expect(screen.getByText(tt('account.deletedList'))).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: rx('account.submit') });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));
    expect(submit).toBeEnabled();
  });

  it('starts unticked every time the dialog opens', async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole('button', { name: rx('account.open') }));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: rx('common.cancel') }));
    await user.click(screen.getByRole('button', { name: rx('account.open') }));

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('deletes, leaves the protected page, then signs out', async () => {
    deleteMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { signOut } = renderSection();
    await confirmAndSubmit(user);

    expect(await screen.findByTestId('landed')).toHaveTextContent('/ deleted');
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('stays on the page, signed in, with a translated error when deletion fails', async () => {
    deleteMock.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    const { signOut } = renderSection();
    await confirmAndSubmit(user);

    await waitFor(() =>
      expect(screen.getByText(tt('errors.account.ACCOUNT_DELETE_FAILED'))).toBeInTheDocument(),
    );
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.queryByTestId('landed')).not.toBeInTheDocument();
  });
});

// What is KEPT must be said before confirming, never discovered after.
describe('DeleteAccountSection — with payments on', () => {
  it('says proof of purchase is kept, only while payments are on', async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole('button', { name: rx('account.open') }));
    expect(screen.queryByText(tt('payments.legal.accountKept'))).toBeNull();
  });

  it('shows the kept-purchases line when on', async () => {
    payments.enabled = true;
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole('button', { name: rx('account.open') }));
    expect(screen.getByText(tt('payments.legal.accountKept'))).toBeInTheDocument();
  });
});
