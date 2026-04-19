import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue } from '../../types/auth';
import { ProtectedRoute } from './ProtectedRoute';

function makeCtx(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    status: 'loading',
    user: null,
    isAdmin: false,
    signOut: async () => {},
    refreshUser: async () => {},
    ...overrides,
  };
}

function SignInStub() {
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  return <div data-testid="signin">signin-from:{state?.from ?? 'none'}</div>;
}

function renderAt(path: string, ctx: AuthContextValue) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <div data-testid="library">library-content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<SignInStub />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('renders a busy/loading state while auth is resolving', () => {
    const { container } = renderAt('/library', makeCtx({ status: 'loading' }));
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByTestId('library')).not.toBeInTheDocument();
    expect(screen.queryByTestId('signin')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderAt(
      '/library',
      makeCtx({
        status: 'authenticated',
        user: { sub: 's', email: 'a@b.co', displayName: 'A', emailVerified: true, groups: [] },
      }),
    );
    expect(screen.getByTestId('library')).toBeInTheDocument();
  });

  it('redirects to /signin when unauthenticated and attaches from-path in router state', () => {
    renderAt('/library?x=1', makeCtx({ status: 'unauthenticated' }));
    expect(screen.getByTestId('signin')).toHaveTextContent('signin-from:/library?x=1');
  });
});
