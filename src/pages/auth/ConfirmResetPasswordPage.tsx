import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { confirmPasswordReset } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import './authShared.css';
import './ConfirmResetPasswordPage.css';

const PASSWORD_HINT =
  'At least 10 characters, with upper- and lower-case letters and a number.';

function errorCopy(code: AuthErrorCode): { title: string; body: string } {
  switch (code) {
    case 'VERIFICATION_CODE_INVALID':
      return {
        title: 'That code does not match.',
        body: 'Double-check the code from your email.',
      };
    case 'VERIFICATION_CODE_EXPIRED':
      return {
        title: 'That code has expired.',
        body: 'Request a new reset code below.',
      };
    case 'PASSWORD_DOES_NOT_MEET_POLICY':
      return { title: 'Password is too weak.', body: PASSWORD_HINT };
    case 'RATE_LIMITED_TRY_LATER':
      return {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      };
    default:
      return {
        title: 'We could not reset your password.',
        body: 'Please try again.',
      };
  }
}

export function ConfirmResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await confirmPasswordReset(email, code.trim(), password);
    setSubmitting(false);
    if (isAuthFailure(result)) {
      setError(result.code);
      return;
    }
    navigate('/signin', { state: { justResetEmail: email } });
  }

  const copy = error ? errorCopy(error) : null;

  return (
    <div className="auth-page confirm-reset-page">
      <header>
        <h1 className="auth-page-title">Set a new password</h1>
        <p className="auth-page-subtitle">
          Enter the code we sent to <strong>{email}</strong> and choose a new password.
        </p>
      </header>

      {copy && (
        <Alert type="danger" title={copy.title}>
          {copy.body}
          {error === 'VERIFICATION_CODE_EXPIRED' && (
            <>
              {' '}
              <Link to="/forgot-password">Request a new code</Link>
            </>
          )}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Reset code" htmlFor="reset-code" required>
          <Input
            id="reset-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="one-time-code"
            inputMode="numeric"
            required
            fullWidth
          />
        </FormField>

        <FormField label="New password" htmlFor="reset-password" helper={PASSWORD_HINT} required>
          <Input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
          />
        </FormField>

        <div className="auth-form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth disabled={submitting}>
            {submitting ? <Spinner size="small" color="white" /> : 'Save new password'}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signin">Back to sign in</Link>
      </div>
    </div>
  );
}
