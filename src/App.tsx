import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminOnlyRoute } from './components/auth/AdminOnlyRoute';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ConfirmSignUpPage } from './pages/auth/ConfirmSignUpPage';
import { SignInPage } from './pages/auth/SignInPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ConfirmResetPasswordPage } from './pages/auth/ConfirmResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Routes>
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

      <Route
        path="/admin"
        element={
          <AdminOnlyRoute>
            <main>Admin area — wire your admin pages here.</main>
          </AdminOnlyRoute>
        }
      />

      <Route path="*" element={<main>Page not found.</main>} />
    </Routes>
  );
}

export default App;
