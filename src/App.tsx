import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/core/Spinner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminOnlyRoute } from './components/auth/AdminOnlyRoute';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ConfirmSignUpPage } from './pages/auth/ConfirmSignUpPage';
import { SignInPage } from './pages/auth/SignInPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ConfirmResetPasswordPage } from './pages/auth/ConfirmResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';

// Lazy-load what most visitors never open, so it stays out of the main
// bundle. The admin area is the example: only admins download it. The
// named-export shim is because React.lazy expects a default export.
const AdminHomePage = lazy(() =>
  import('./pages/admin/AdminHomePage').then((m) => ({ default: m.AdminHomePage })),
);

function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      {/* Every page renders inside the shell (navbar + footer). A route that
          must be full-screen (a slide deck, a kiosk view) goes outside it. */}
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/confirm" element={<ConfirmSignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/confirm" element={<ConfirmResetPasswordPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* AdminOnlyRoute renders an <Outlet />, so admin pages nest here and
            share one guard. */}
        <Route path="/admin" element={<AdminOnlyRoute />}>
          <Route
            index
            element={
              <Suspense fallback={<Spinner size="large" />}>
                <AdminHomePage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<main>{t('common.pageNotFound')}</main>} />
      </Route>
    </Routes>
  );
}

export default App;
