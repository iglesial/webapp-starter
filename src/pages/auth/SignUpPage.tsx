import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { signUpWithDisplayName } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import {
  displayNameErrorMessage,
  isDisplayNameInvalid,
  validateDisplayName,
} from '../../utils/validation';
import './authShared.css';
import './SignUpPage.css';

const PASSWORD_HINT =
  'At least 10 characters, with upper- and lower-case letters and a number.';

function topErrorCopy(code: AuthErrorCode): { title: string; body: string } {
  switch (code) {
    case 'EMAIL_ALREADY_REGISTERED':
      return {
        title: 'That email is already registered.',
        body: 'Try signing in, or reset your password if you forgot it.',
      };
    case 'PASSWORD_DOES_NOT_MEET_POLICY':
      return {
        title: 'Password is too weak.',
        body: PASSWORD_HINT,
      };
    case 'RATE_LIMITED_TRY_LATER':
      return {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      };
    default:
      return {
        title: 'We could not create your account.',
        body: 'Please check your details and try again.',
      };
  }
}

export function SignUpPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [topError, setTopError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/library" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);

    const nameCheck = validateDisplayName(displayName);
    if (isDisplayNameInvalid(nameCheck)) {
      setDisplayNameError(displayNameErrorMessage(nameCheck.reason));
      return;
    }
    setDisplayNameError(undefined);

    setSubmitting(true);
    const result = await signUpWithDisplayName({
      email: email.trim(),
      password,
      displayName: nameCheck.value,
    });
    setSubmitting(false);

    if (isAuthFailure(result)) {
      setTopError(result.code);
      return;
    }
    navigate('/confirm', { state: { email: email.trim() } });
  }

  const topCopy = topError ? topErrorCopy(topError) : null;

  return (
    <div className="auth-page signup-page">
      <header>
        <h1 className="auth-page-title">Create your account</h1>
        <p className="auth-page-subtitle">
          Pick a display name — it's the name other users will see.
        </p>
      </header>

      {topCopy && (
        <Alert type={topError === 'EMAIL_ALREADY_REGISTERED' ? 'warning' : 'danger'} title={topCopy.title}>
          {topCopy.body}
          {topError === 'EMAIL_ALREADY_REGISTERED' && (
            <>
              {' '}
              <Link to="/signin">Sign in</Link>
              {' · '}
              <Link to="/forgot-password">Reset password</Link>
            </>
          )}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Email" htmlFor="signup-email" required>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="signup-password"
          helper={PASSWORD_HINT}
          required
        >
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
          />
        </FormField>

        <FormField
          label="Display name"
          htmlFor="signup-display-name"
          error={displayNameError}
          helper="3–30 characters. Not unique — pick anything you like."
          required
        >
          <Input
            id="signup-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="nickname"
            required
            fullWidth
          />
        </FormField>

        <div className="auth-form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth disabled={submitting}>
            {submitting ? <Spinner size="small" color="white" /> : 'Create account'}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signin">Already have an account? Sign in</Link>
      </div>
    </div>
  );
}
