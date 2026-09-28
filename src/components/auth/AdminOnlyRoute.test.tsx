import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminOnlyRoute } from './AdminOnlyRoute';
import { AuthProvider } from '../../contexts/AuthProvider';
import * as authService from '../../services/authService';
import type { AuthUser } from '../../types/auth';
import { rxIn } from '../../test/i18n';

vi.mock('aws-amplify/utils', () => ({
  Hub: { listen: vi.fn(() => () => {}) },
}));

vi.mock('../../services/authService', () => ({
  fetchCurrentUser: vi.fn(),
  signOutCurrentUser: vi.fn(),
}));

const adminUser: AuthUser = {
  sub: 'admin-1',
  email: 'admin@example.com',
  displayName: 'Admin',
  emailVerified: true,
  locale: null,
  groups: ['admin'],
};

const regularUser: AuthUser = { ...adminUser, groups: [] };

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/stories"
            element={
              <AdminOnlyRoute>
                <main data-testid="admin-content">admin content</main>
              </AdminOnlyRoute>
            }
          />
          <Route path="/signin" element={<main>sign in page</main>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminOnlyRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders children for an admin user', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(adminUser);
    renderAt('/admin/stories');
    await waitFor(() =>
      expect(screen.getByTestId('admin-content')).toBeInTheDocument(),
    );
  });

  it('renders a not-authorized Alert for a non-admin authenticated user', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(regularUser);
    renderAt('/admin/stories');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(rxIn('adminGate.title')),
    );
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('redirects an unauthenticated user to /signin', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(null);
    renderAt('/admin/stories');
    await waitFor(() =>
      expect(screen.getByText('sign in page')).toBeInTheDocument(),
    );
  });
});
