import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { AFTER_SIGN_IN_PATH } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { signInWithCredentials } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import { authErrorCopy } from '../../i18n/authErrors';
import './authShared.css';
import './SignInPage.css';

export function SignInPage() {
  const { t } = useTranslation();
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
    return <Navigate to={state?.from ?? AFTER_SIGN_IN_PATH} replace />;
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
    navigate(state?.from ?? AFTER_SIGN_IN_PATH, { replace: true });
  }

  const topCopy = topError ? authErrorCopy('signIn', topError) : null;

  return (
    <div className="auth-page signin-page">
      <header>
        <h1 className="auth-page-title">{t('auth.signIn.title')}</h1>
        <p className="auth-page-subtitle">{t('auth.signIn.subtitle')}</p>
      </header>

      {state?.justConfirmedEmail && !topError && (
        <Alert type="success" title={t('auth.signIn.emailVerifiedTitle')}>
          {t('auth.signIn.emailVerifiedBody')}
        </Alert>
      )}

      {topCopy && (
        <Alert type="danger" title={t(topCopy.title)}>
          {t(topCopy.body)}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label={t('auth.emailLabel')} htmlFor="signin-email" required>
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

        <FormField label={t('auth.passwordLabel')} htmlFor="signin-password" required>
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
            {submitting ? <Spinner size="small" color="white" /> : t('auth.signIn.submit')}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/forgot-password">{t('auth.signIn.forgotPassword')}</Link>
        <Link to="/signup">{t('auth.signIn.createAccount')}</Link>
      </div>
    </div>
  );
}
