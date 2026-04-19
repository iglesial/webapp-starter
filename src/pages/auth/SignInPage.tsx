import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { signInWithCredentials } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import './authShared.css';
import './SignInPage.css';

function errorCopy(code: AuthErrorCode): { title: string; body: string } {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      // FR-009: must not distinguish unknown-email from wrong-password.
      return {
        title: 'Sign-in failed.',
        body: 'Your email and password did not match an account. Please try again.',
      };
    case 'RATE_LIMITED_TRY_LATER':
      return {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      };
    default:
      return {
        title: 'We could not sign you in.',
        body: 'Please try again.',
      };
  }
}

export function SignInPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { from?: string; justConfirmedEmail?: string }
    | null;

  const [email, setEmail] = useState(state?.justConfirmedEmail ?? '');
  const [password, setPassword] = useState('');
  const [topError, setTopError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={state?.from ?? '/library'} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);
    setSubmitting(true);
    const result = await signInWithCredentials(email.trim(), password);
    setSubmitting(false);

    if (isAuthFailure(result)) {
      if (result.code === 'USER_NOT_CONFIRMED') {
        navigate('/confirm', { state: { email: email.trim() } });
        return;
      }
      setTopError(result.code);
      return;
    }
    navigate(state?.from ?? '/library', { replace: true });
  }

  const topCopy = topError ? errorCopy(topError) : null;

  return (
    <div className="auth-page signin-page">
      <header>
        <h1 className="auth-page-title">Welcome back</h1>
        <p className="auth-page-subtitle">Sign in to continue your story.</p>
      </header>

      {state?.justConfirmedEmail && !topError && (
        <Alert type="success" title="Email verified">
          Your account is ready. Sign in to get started.
        </Alert>
      )}

      {topCopy && (
        <Alert type="danger" title={topCopy.title}>
          {topCopy.body}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Email" htmlFor="signin-email" required>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
        </FormField>

        <FormField label="Password" htmlFor="signin-password" required>
          <Input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />
        </FormField>

        <div className="auth-form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth disabled={submitting}>
            {submitting ? <Spinner size="small" color="white" /> : 'Sign in'}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Create an account</Link>
      </div>
    </div>
  );
}
