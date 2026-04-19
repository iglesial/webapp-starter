import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Alert } from '../core/Alert';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import './AdminOnlyRoute.css';

export interface AdminOnlyRouteProps {
  children?: ReactNode;
}

export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  return (
    <ProtectedRoute>
      <AdminGate>{children}</AdminGate>
    </ProtectedRoute>
  );
}

function AdminGate({ children }: { children?: ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="admin-only-denied" role="region" aria-label="Access denied">
        <Alert type="warning" title="Admin access required">
          You need admin access to view this page. If you believe this is a
          mistake, ask a project admin to add you to the <code>admin</code> group.
        </Alert>
      </div>
    );
  }
  return <>{children ?? <Outlet />}</>;
}
