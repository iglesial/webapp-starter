import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextValue, AuthUser } from '../types/auth';
import { updateDisplayName } from '../services/authService';
import { ProfilePage } from './ProfilePage';

vi.mock('../services/authService', () => ({
  updateDisplayName: vi.fn(),
}));

const alice: AuthUser = {
  sub: 'sub-alice',
  email: 'alice@b.co',
  displayName: 'Alice',
  emailVerified: true,
  groups: [],
};

function Landed() {
  const location = useLocation();
  return <div data-testid="landed">{location.pathname}</div>;
}

function makeCtx(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    status: 'authenticated',
    user: alice,
    isAdmin: false,
    signOut: vi.fn(async () => {}),
    refreshUser: vi.fn(async () => {}),
    ...overrides,
  };
}

function renderPage(ctx: AuthContextValue = makeCtx({})) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<Landed />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProfilePage — identity rendering', () => {
  it("renders the user's email and display name", () => {
    renderPage();
    expect(screen.getByText('alice@b.co')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

describe('ProfilePage — display-name edit', () => {
  it('switches from view to edit mode when Edit is clicked and prefills the current name', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByLabelText(/new display name/i)).toHaveValue('Alice');
  });

  it('saves a valid new display name, calls refreshUser, and exits edit mode', async () => {
    vi.mocked(updateDisplayName).mockResolvedValue({ ok: true, value: undefined });
    const ctx = makeCtx({});
    renderPage(ctx);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByLabelText(/new display name/i);
    await user.clear(input);
    await user.type(input, 'Alice-2');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(updateDisplayName).toHaveBeenCalledWith('Alice-2'));
    expect(ctx.refreshUser).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText(/display name updated/i)).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText(/new display name/i)).not.toBeInTheDocument();
  });

  it('rejects a 2-char display name with a validation message and does NOT call the service', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByLabelText(/new display name/i);
    await user.clear(input);
    await user.type(input, 'ab');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(updateDisplayName).not.toHaveBeenCalled();
  });

  it('surfaces a save error and keeps the form open on service failure', async () => {
    vi.mocked(updateDisplayName).mockResolvedValue({
      ok: false,
      code: 'RATE_LIMITED_TRY_LATER',
    });
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByLabelText(/new display name/i);
    await user.clear(input);
    await user.type(input, 'Valid Name');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(screen.getByText(/could not save/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/new display name/i)).toBeInTheDocument();
  });

  it('exits edit mode and reverts when Cancel is clicked', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByLabelText(/new display name/i);
    await user.clear(input);
    await user.type(input, 'Something Else');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByLabelText(/new display name/i)).not.toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(updateDisplayName).not.toHaveBeenCalled();
  });
});

describe('ProfilePage — sign out', () => {
  it('invokes auth signOut and navigates back to / on click', async () => {
    const ctx = makeCtx({});
    renderPage(ctx);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    await waitFor(() => expect(ctx.signOut).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/'));
  });
});
