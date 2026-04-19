import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import {
  confirmSignUpWithCode,
  resendConfirmationCode,
} from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import './authShared.css';
import './ConfirmSignUpPage.css';

function errorCopy(code: AuthErrorCode): { title: string; body: string } {
  switch (code) {
    case 'VERIFICATION_CODE_INVALID':
      return {
        title: 'That code does not match.',
        body: 'Double-check the code from your email and try again.',
      };
    case 'VERIFICATION_CODE_EXPIRED':
      return {
        title: 'That code has expired.',
        body: 'Request a new code — the last one is no longer valid.',
      };
    default:
      return {
        title: 'We could not confirm your account.',
        body: 'Please try again or request a new code.',
      };
  }
}

export function ConfirmSignUpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [code, setCode] = useState('');
  const [topError, setTopError] = useState<AuthErrorCode | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);
    setResendNotice(null);
    setSubmitting(true);
    const result = await confirmSignUpWithCode(email, code.trim());
    setSubmitting(false);
    if (isAuthFailure(result)) {
      setTopError(result.code);
      return;
    }
    navigate('/signin', {
      state: { justConfirmedEmail: email },
    });
  }

  async function handleResend() {
    setTopError(null);
    setResendNotice(null);
    setResending(true);
    const result = await resendConfirmationCode(email);
    setResending(false);
    if (isAuthFailure(result)) {
      setTopError(result.code);
      return;
    }
    setResendNotice('A new code is on its way to your inbox.');
  }

  const topCopy = topError ? errorCopy(topError) : null;

  return (
    <div className="auth-page confirm-page">
      <header>
        <h1 className="auth-page-title">Check your email</h1>
        <p className="auth-page-subtitle">
          We sent a verification code to <strong>{email}</strong>.
        </p>
      </header>

      {topCopy && (
        <Alert type="danger" title={topCopy.title}>
          {topCopy.body}
        </Alert>
      )}

      {resendNotice && (
        <Alert type="success" title="Code resent">
          {resendNotice}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Verification code" htmlFor="confirm-code" required>
          <Input
            id="confirm-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="one-time-code"
            inputMode="numeric"
            required
            fullWidth
          />
        </FormField>

        <div className="auth-form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth disabled={submitting}>
            {submitting ? <Spinner size="small" color="white" /> : 'Confirm account'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="large"
            fullWidth
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? <Spinner size="small" /> : 'Resend code'}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signup">Use a different email</Link>
      </div>
    </div>
  );
}
