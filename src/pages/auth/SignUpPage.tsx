import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { AFTER_SIGN_IN_PATH } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { signUpWithDisplayName } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import {
  displayNameErrorKey,
  DISPLAY_NAME_LIMITS,
  isDisplayNameInvalid,
  validateDisplayName,
} from '../../utils/validation';
import { authErrorCopy } from '../../i18n/authErrors';
import './authShared.css';
import './SignUpPage.css';

export function SignUpPage() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [topError, setTopError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={AFTER_SIGN_IN_PATH} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);

    const nameCheck = validateDisplayName(displayName);
    if (isDisplayNameInvalid(nameCheck)) {
      setDisplayNameError(t(displayNameErrorKey(nameCheck.reason), DISPLAY_NAME_LIMITS));
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

  const topCopy = topError ? authErrorCopy('signUp', topError) : null;

  return (
    <div className="auth-page signup-page">
      <header>
        <h1 className="auth-page-title">{t('auth.signUp.title')}</h1>
        <p className="auth-page-subtitle">{t('auth.signUp.subtitle')}</p>
      </header>

      {topCopy && (
        <Alert type={topError === 'EMAIL_ALREADY_REGISTERED' ? 'warning' : 'danger'} title={t(topCopy.title)}>
          {t(topCopy.body)}
          {topError === 'EMAIL_ALREADY_REGISTERED' && (
            <>
              {' '}
              <Link to="/signin">{t('auth.signUp.signInLink')}</Link>
              {' · '}
              <Link to="/forgot-password">{t('auth.signUp.resetLink')}</Link>
            </>
          )}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label={t('auth.emailLabel')} htmlFor="signup-email" required>
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
          label={t('auth.passwordLabel')}
          htmlFor="signup-password"
          helper={t('auth.passwordHint')}
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
          label={t('auth.displayNameLabel')}
          htmlFor="signup-display-name"
          error={displayNameError}
          helper={t('auth.displayNameHelper')}
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
            {submitting ? <Spinner size="small" color="white" /> : t('auth.signUp.submit')}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signin">{t('auth.signUp.haveAccount')}</Link>
      </div>
    </div>
  );
}
