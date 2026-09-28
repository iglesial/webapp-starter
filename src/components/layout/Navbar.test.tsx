import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';
import { rx } from '../../test/i18n';
import type { AuthUser } from '../../types/auth';

type AuthMock = {
  status: 'loading' | 'unauthenticated' | 'authenticated';
  user: AuthUser | null;
  isAdmin: boolean;
  signOut: ReturnType<typeof vi.fn>;
  refreshUser: ReturnType<typeof vi.fn>;
};

function mockAuth(overrides: Partial<AuthMock>) {
  const base: AuthMock = {
    status: 'loading',
    user: null,
    isAdmin: false,
    signOut: vi.fn(async () => {}),
    refreshUser: vi.fn(async () => {}),
  };
  const value = { ...base, ...overrides };
  vi.mocked(useAuth).mockReturnValue(value as ReturnType<typeof useAuth>);
  return value;
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

const aliceUser: AuthUser = {
  sub: 'sub-alice',
  email: 'alice@b.co',
  displayName: 'Alice',
  emailVerified: true,
  locale: null,
  groups: [],
};

const aliceAuthed = {
  status: 'authenticated' as const,
  user: aliceUser,
  isAdmin: false,
};

describe('Navbar — loading variant', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders only the wordmark during the auth-loading phase', () => {
    mockAuth({ status: 'loading' });
    renderNavbar();
    expect(screen.getByRole('link', { name: rx('common.appName') })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: rx('nav.signIn') })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: rx('nav.signUp') })).not.toBeInTheDocument();
  });
});

describe('Navbar — unauthenticated variant', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the wordmark, Sign in link, and Sign up CTA', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    expect(screen.getByRole('link', { name: rx('common.appName') })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: rx('nav.signIn') })).toHaveAttribute('href', '/signin');
    const cta = screen.getByRole('link', { name: rx('nav.signUp') });
    expect(cta).toHaveAttribute('href', '/signup');
    // Never a button nested in the link (invalid HTML, announced twice).
    expect(cta.querySelector('button')).toBeNull();
  });

  it('does not render authenticated-only links', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    expect(screen.queryByRole('link', { name: rx('nav.admin') })).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/profile"]')).toBeNull();
  });
});

describe('Navbar — authenticated variant', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the profile link and Sign out button', () => {
    mockAuth(aliceAuthed);
    renderNavbar();
    expect(screen.getByRole('link', { name: rx('common.appName') })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /alice/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('button', { name: rx('nav.signOut') })).toBeInTheDocument();
  });

  it('truncates the profile name beyond 20 characters with an ellipsis', () => {
    mockAuth({
      ...aliceAuthed,
      user: { ...aliceUser, displayName: 'A very long display name that should truncate' },
    });
    renderNavbar();
    const profileLink = screen.getByRole('link', { name: /…/ });
    expect(profileLink.textContent ?? '').toMatch(/…/);
  });
});

describe('Navbar — admin link', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the Admin link when isAdmin is true', () => {
    mockAuth({ ...aliceAuthed, isAdmin: true });
    renderNavbar();
    expect(screen.getByRole('link', { name: rx('nav.admin') })).toHaveAttribute('href', '/admin');
  });

  it('does NOT render the Admin link when isAdmin is false', () => {
    mockAuth({ ...aliceAuthed, isAdmin: false });
    renderNavbar();
    expect(screen.queryByRole('link', { name: rx('nav.admin') })).not.toBeInTheDocument();
  });

  it('reactively adds the Admin link when isAdmin flips true', () => {
    mockAuth({ ...aliceAuthed, isAdmin: false });
    const { rerender } = renderNavbar();
    expect(screen.queryByRole('link', { name: rx('nav.admin') })).not.toBeInTheDocument();
    mockAuth({ ...aliceAuthed, isAdmin: true });
    rerender(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: rx('nav.admin') })).toHaveAttribute('href', '/admin');
  });
});

describe('Navbar — Sign out button', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls useAuth().signOut when clicked', async () => {
    const auth = mockAuth(aliceAuthed);
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: rx('nav.signOut') }));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalledTimes(1));
  });

  it('does not render Sign out when unauthenticated', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    expect(screen.queryByRole('button', { name: rx('nav.signOut') })).not.toBeInTheDocument();
  });
});

describe('Navbar — mobile hamburger', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the hamburger button closed by default', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    expect(screen.getByLabelText(rx('nav.openMenu'))).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog', { name: rx('nav.primary') })).not.toBeInTheDocument();
  });

  it('opens the mobile panel and flips the hamburger label on click', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    fireEvent.click(screen.getByLabelText(rx('nav.openMenu')));
    expect(screen.getByLabelText(rx('nav.closeMenu'))).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: rx('nav.primary') })).toBeInTheDocument();
  });

  it('unauthenticated mobile panel has Sign in and Sign up entries', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    fireEvent.click(screen.getByLabelText(rx('nav.openMenu')));
    const panel = screen.getByRole('dialog', { name: rx('nav.primary') });
    expect(panel.querySelector('a[href="/signin"]')).not.toBeNull();
    expect(panel.querySelector('a[href="/signup"]')).not.toBeNull();
  });

  it('authenticated mobile panel has Profile and Sign out — no Admin for non-admins', () => {
    mockAuth(aliceAuthed);
    renderNavbar();
    fireEvent.click(screen.getByLabelText(rx('nav.openMenu')));
    const panel = screen.getByRole('dialog', { name: rx('nav.primary') });
    expect(panel.querySelector('a[href="/profile"]')).not.toBeNull();
    expect(panel.querySelector('a[href="/admin"]')).toBeNull();
    expect(
      Array.from(panel.querySelectorAll('button')).some((b) => rx('nav.signOut').test(b.textContent ?? '')),
    ).toBe(true);
  });

  it('admin mobile panel includes the Admin entry', () => {
    mockAuth({ ...aliceAuthed, isAdmin: true });
    renderNavbar();
    fireEvent.click(screen.getByLabelText(rx('nav.openMenu')));
    const panel = screen.getByRole('dialog', { name: rx('nav.primary') });
    expect(panel.querySelector('a[href="/admin"]')).not.toBeNull();
  });

  it('closes on Escape and returns focus to the hamburger', async () => {
    mockAuth({ status: 'unauthenticated' });
    const user = userEvent.setup();
    renderNavbar();
    await user.click(screen.getByLabelText(rx('nav.openMenu')));
    expect(screen.getByRole('dialog', { name: rx('nav.primary') })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: rx('nav.primary') })).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText(rx('nav.openMenu'))).toHaveFocus();
  });

  it('closes when clicking outside the panel', () => {
    mockAuth({ status: 'unauthenticated' });
    renderNavbar();
    fireEvent.click(screen.getByLabelText(rx('nav.openMenu')));
    expect(screen.getByRole('dialog', { name: rx('nav.primary') })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog', { name: rx('nav.primary') })).not.toBeInTheDocument();
  });
});
