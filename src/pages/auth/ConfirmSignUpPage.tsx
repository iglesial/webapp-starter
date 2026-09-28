import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
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
import { authErrorCopy } from '../../i18n/authErrors';
import './authShared.css';
import './ConfirmSignUpPage.css';

export function ConfirmSignUpPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [code, setCode] = useState('');
  const [topError, setTopError] = useState<AuthErrorCode | null>(null);
  const [resent, setResent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);
    setResent(false);
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
    setResent(false);
    setResending(true);
    const result = await resendConfirmationCode(email);
    setResending(false);
    if (isAuthFailure(result)) {
      setTopError(result.code);
      return;
    }
    setResent(true);
  }

  const topCopy = topError ? authErrorCopy('confirmSignUp', topError) : null;

  return (
    <div className="auth-page confirm-page">
      <header>
        <h1 className="auth-page-title">{t('auth.confirmSignUp.title')}</h1>
        <p className="auth-page-subtitle">
          <Trans
            i18nKey="auth.confirmSignUp.subtitle"
            values={{ email }}
            components={{ b: <strong /> }}
          />
        </p>
      </header>

      {topCopy && (
        <Alert type="danger" title={t(topCopy.title)}>
          {t(topCopy.body)}
        </Alert>
      )}

      {resent && (
        <Alert type="success" title={t('auth.confirmSignUp.resentTitle')}>
          {t('auth.confirmSignUp.resentBody')}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label={t('auth.confirmSignUp.codeLabel')} htmlFor="confirm-code" required>
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
            {submitting ? <Spinner size="small" color="white" /> : t('auth.confirmSignUp.submit')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="large"
            fullWidth
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? <Spinner size="small" /> : t('auth.confirmSignUp.resend')}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signup">{t('auth.confirmSignUp.differentEmail')}</Link>
      </div>
    </div>
  );
}
