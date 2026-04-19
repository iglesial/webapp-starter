import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '../core/Spinner';
import { useAuth } from '../../hooks/useAuth';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="protected-route-loading" aria-busy="true" aria-live="polite">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    const from = location.pathname + location.search;
    return <Navigate to="/signin" state={{ from }} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
