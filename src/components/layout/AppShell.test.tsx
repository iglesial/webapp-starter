import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    status: 'unauthenticated',
    user: null,
    isAdmin: false,
    signOut: vi.fn(),
    refreshUser: vi.fn(),
  })),
}));

import { AppShell } from './AppShell';
import { rx } from '../../test/i18n';

function renderAt(path: string, pageContent: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<>{pageContent}</>} />
          <Route path="/other" element={<div data-testid="other">other page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the Navbar above the outlet content', () => {
    renderAt('/', <main data-testid="page-content">Landing</main>);
    // Navbar renders as <nav aria-label={t('nav.primary')}>
    const nav = screen.getByRole('navigation', { name: rx('nav.primary') });
    const page = screen.getByTestId('page-content');
    expect(nav).toBeInTheDocument();
    expect(page).toBeInTheDocument();
    // Nav precedes page content in DOM order.
    expect(
      nav.compareDocumentPosition(page) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });

  // The footer lives here rather than on the homepage, so legal information
  // is reachable from every route. Asserting it at the shell is what proves
  // "every page" — a Footer-only test cannot.
  it('renders the footer below the outlet content on every route', () => {
    renderAt('/other', null);

    const footer = screen.getByRole('contentinfo');
    const page = screen.getByTestId('other');
    expect(footer).toBeInTheDocument();
    expect(
      page.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });
});
