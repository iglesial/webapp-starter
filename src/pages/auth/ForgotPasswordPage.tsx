import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { FormField } from '../../components/core/FormField';
import { Input } from '../../components/core/Input';
import { Spinner } from '../../components/core/Spinner';
import { requestPasswordReset } from '../../services/authService';
import { isAuthFailure, type AuthErrorCode } from '../../types/auth';
import { authErrorCopy } from '../../i18n/authErrors';
import './authShared.css';
import './ForgotPasswordPage.css';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // FR-012: requestPasswordReset absorbs UserNotFoundException, so the
    // success UI is identical for registered and unregistered emails.
    const result = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (isAuthFailure(result)) {
      setError(result.code);
      return;
    }
    navigate('/forgot-password/confirm', { state: { email: email.trim() } });
  }

  return (
    <div className="auth-page forgot-page">
      <header>
        <h1 className="auth-page-title">{t('auth.forgotPassword.title')}</h1>
        <p className="auth-page-subtitle">{t('auth.forgotPassword.subtitle')}</p>
      </header>

      {error && (
        <Alert type="danger" title={t(authErrorCopy('forgotPassword', error).title)}>
          {t(authErrorCopy('forgotPassword', error).body)}
        </Alert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label={t('auth.emailLabel')} htmlFor="forgot-email" required>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
        </FormField>

        <div className="auth-form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth disabled={submitting}>
            {submitting ? <Spinner size="small" color="white" /> : t('auth.forgotPassword.submit')}
          </Button>
        </div>
      </form>

      <div className="auth-page-footer-links">
        <Link to="/signin">{t('auth.forgotPassword.backToSignIn')}</Link>
      </div>
    </div>
  );
}
