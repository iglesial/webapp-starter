import { Trans, useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="admin-only-denied" role="region" aria-label={t('adminGate.deniedRegion')}>
        <Alert type="warning" title={t('adminGate.title')}>
          <Trans i18nKey="adminGate.body" components={{ code: <code /> }} />
        </Alert>
      </div>
    );
  }
  return <>{children ?? <Outlet />}</>;
}
