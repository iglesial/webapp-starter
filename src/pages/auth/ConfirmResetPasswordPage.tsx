import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { confirmPasswordReset } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import { authErrorCopy } from '../../i18n/authErrors';
import './authShared.css';
import './ConfirmResetPasswordPage.css';

export function ConfirmResetPasswordPage() {
  const { t } = useTranslation();
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

  const copy = error ? authErrorCopy('confirmReset', error) : null;

  return (
    <div className="auth-page confirm-reset-page">
      <header>
        <h1 className="auth-page-title">{t('auth.confirmReset.title')}</h1>
        <p className="auth-page-subtitle">
          <Trans
            i18nKey="auth.confirmReset.subtitle"
            values={{ email }}
            components={{ b: <strong /> }}
          />
        </p>
      </header>

      {copy && (
        <Alert type="danger" title={t(copy.title)}>
          {t(copy.body)}
          {error === 'VERIFICATION_CODE_EXPIRED' && (
            <>
              {' '}
              <Link to="/forgot-password">{t('auth.confirmReset.requestNewCode')}</Link>
            </>
          )}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label={t('auth.confirmReset.codeLabel')} htmlFor="reset-code" required>
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

        <FormField
          label={t('auth.confirmReset.newPasswordLabel')}
          htmlFor="reset-password"
          helper={t('auth.passwordHint')}
          required
        >
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
            {submitting ? <Spinner size="small" color="white" /> : t('auth.confirmReset.submit')}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signin">{t('auth.forgotPassword.backToSignIn')}</Link>
      </div>
    </div>
  );
}
