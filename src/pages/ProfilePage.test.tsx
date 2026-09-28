import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../contexts/AuthContext';
import { LocaleContext } from '../contexts/LocaleContext';
import type { AuthContextValue, AuthUser } from '../types/auth';
import { updateDisplayName } from '../services/authService';
import { ProfilePage } from './ProfilePage';
import { DISPLAY_NAME_LIMITS } from '../utils/validation';
import { rx, tt } from '../test/i18n';

vi.mock('../services/authService', () => ({
  updateDisplayName: vi.fn(),
}));

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
    await user.click(screen.getByRole('button', { name: rx('profile.edit') }));
    expect(screen.getByLabelText(rx('profile.newDisplayName'))).toHaveValue('Alice');
  });

  it('saves a valid new display name, calls refreshUser, and exits edit mode', async () => {
    vi.mocked(updateDisplayName).mockResolvedValue({ ok: true, value: undefined });
    const ctx = makeCtx({});
    renderPage(ctx);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: rx('profile.edit') }));
    const input = screen.getByLabelText(rx('profile.newDisplayName'));
    await user.clear(input);
    await user.type(input, 'Alice-2');
    await user.click(screen.getByRole('button', { name: rx('common.save') }));

    await waitFor(() => expect(updateDisplayName).toHaveBeenCalledWith('Alice-2'));
    expect(ctx.refreshUser).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText(tt('profile.displayNameSaved'))).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText(rx('profile.newDisplayName'))).not.toBeInTheDocument();
  });

  it('rejects a 2-char display name with a validation message and does NOT call the service', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: rx('profile.edit') }));
    const input = screen.getByLabelText(rx('profile.newDisplayName'));
    await user.clear(input);
    await user.type(input, 'ab');
    await user.click(screen.getByRole('button', { name: rx('common.save') }));

    expect(screen.getByText(tt('validation.displayName.tooShort', DISPLAY_NAME_LIMITS))).toBeInTheDocument();
    expect(updateDisplayName).not.toHaveBeenCalled();
  });

  it('surfaces a save error and keeps the form open on service failure', async () => {
    vi.mocked(updateDisplayName).mockResolvedValue({
      ok: false,
      code: 'RATE_LIMITED_TRY_LATER',
    });
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: rx('profile.edit') }));
    const input = screen.getByLabelText(rx('profile.newDisplayName'));
    await user.clear(input);
    await user.type(input, 'Valid Name');
    await user.click(screen.getByRole('button', { name: rx('common.save') }));

    await waitFor(() => expect(screen.getByText(tt('profile.displayNameSaveFailed'))).toBeInTheDocument());
    expect(screen.getByLabelText(rx('profile.newDisplayName'))).toBeInTheDocument();
  });

  it('exits edit mode and reverts when Cancel is clicked', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: rx('profile.edit') }));
    const input = screen.getByLabelText(rx('profile.newDisplayName'));
    await user.clear(input);
    await user.type(input, 'Something Else');
    await user.click(screen.getByRole('button', { name: rx('common.cancel') }));

    expect(screen.queryByLabelText(rx('profile.newDisplayName'))).not.toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(updateDisplayName).not.toHaveBeenCalled();
  });
});

describe('ProfilePage — sign out', () => {
  it('invokes auth signOut and navigates back to / on click', async () => {
    const ctx = makeCtx({});
    renderPage(ctx);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: rx('nav.signOut') }));
    await waitFor(() => expect(ctx.signOut).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('landed')).toHaveTextContent('/'));
  });
});

describe('ProfilePage — language', () => {
  it('offers a language setting alongside the profile fields', () => {
    renderPage();

    expect(screen.getByRole('group', { name: rx('nav.language') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Français' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });
});

describe('ProfilePage — language save outcome', () => {
  function renderWithLocaleState(saveState: 'idle' | 'saved' | 'failed') {
    return render(
      <LocaleContext.Provider value={{ setLocale: vi.fn(), saveState }}>
        <AuthContext.Provider value={makeCtx({})}>
          <MemoryRouter>
            <ProfilePage />
          </MemoryRouter>
        </AuthContext.Provider>
      </LocaleContext.Provider>,
    );
  }

  it('warns when the language could not be saved to the account', () => {
    renderWithLocaleState('failed');
    expect(screen.getByRole('alert')).toHaveTextContent(tt('profile.language.saveFailed'));
  });

  it('stays quiet when the save succeeded or nothing happened', () => {
    renderWithLocaleState('saved');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
