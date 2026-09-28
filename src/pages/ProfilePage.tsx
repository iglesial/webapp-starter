import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../components/core/Alert';
import { Button } from '../components/core/Button';
import { Card } from '../components/core/Card';
import { LocaleToggle } from '../components/layout/LocaleToggle';
import { FormField } from '../components/core/FormField';
import { Input } from '../components/core/Input';
import { Spinner } from '../components/core/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import { updateDisplayName } from '../services/authService';
import { isAuthFailure } from '../types/auth';
import {
  displayNameErrorKey,
  DISPLAY_NAME_LIMITS,
  isDisplayNameInvalid,
  validateDisplayName,
} from '../utils/validation';
import './ProfilePage.css';

type EditState =
  | { mode: 'view' }
  | { mode: 'edit'; draft: string; error?: string; submitting: boolean };

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser, signOut } = useAuth();
  const { saveState: localeSaveState } = useLocale();
  const navigate = useNavigate();
  const [edit, setEdit] = useState<EditState>({ mode: 'view' });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  if (!user) return null; // ProtectedRoute guarantees user, but satisfy the type.

  function beginEdit() {
    if (!user) return;
    setSaveError(null);
    setSaveOk(null);
    setEdit({ mode: 'edit', draft: user.displayName, submitting: false });
  }

  function cancelEdit() {
    setEdit({ mode: 'view' });
    setSaveError(null);
  }

  async function submitEdit(e: FormEvent) {
    e.preventDefault();
    if (edit.mode !== 'edit') return;
    const check = validateDisplayName(edit.draft);
    if (isDisplayNameInvalid(check)) {
      setEdit({ ...edit, error: t(displayNameErrorKey(check.reason), DISPLAY_NAME_LIMITS) });
      return;
    }
    setEdit({ ...edit, error: undefined, submitting: true });
    const result = await updateDisplayName(check.value);
    if (isAuthFailure(result)) {
      setEdit({ mode: 'edit', draft: edit.draft, submitting: false });
      setSaveError(t('profile.displayNameSaveFailed'));
      return;
    }
    await refreshUser();
    setEdit({ mode: 'view' });
    setSaveOk(t('profile.displayNameSaved'));
  }

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <h1 className="profile-page-title">{t('profile.title')}</h1>
        <p className="profile-page-subtitle">{t('profile.subtitle')}</p>
      </header>

      {saveOk && (
        <Alert type="success" title={t('profile.savedTitle')}>
          {saveOk}
        </Alert>
      )}
      {saveError && (
        <Alert type="danger" title={t('profile.saveFailedTitle')}>
          {saveError}
        </Alert>
      )}
      {/* The switch itself already happened (it is optimistic); only a failed
          account write needs saying, or the choice silently won't follow
          the user to their next device. */}
      {localeSaveState === 'failed' && (
        <Alert type="warning">{t('profile.language.saveFailed')}</Alert>
      )}

      <Card padding="large" className="profile-card">
        <div className="profile-row">
          <span className="profile-row-label">{t('profile.email')}</span>
          <span className="profile-row-value">{user.email}</span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">{t('profile.displayName')}</span>
          {edit.mode === 'view' ? (
            <div className="profile-row-value-group">
              <span className="profile-row-value">{user.displayName}</span>
              <Button variant="secondary" size="small" onClick={beginEdit}>
                {t('profile.edit')}
              </Button>
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={submitEdit} noValidate>
              <FormField
                label={t('profile.newDisplayName')}
                htmlFor="profile-display-name"
                error={edit.error}
                helper={t('auth.displayNameHelper')}
              >
                <Input
                  id="profile-display-name"
                  type="text"
                  value={edit.draft}
                  onChange={(e) =>
                    setEdit({ mode: 'edit', draft: e.target.value, submitting: false })
                  }
                  autoComplete="nickname"
                  autoFocus
                  fullWidth
                />
              </FormField>
              <div className="profile-edit-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="small"
                  disabled={edit.submitting}
                >
                  {edit.submitting ? <Spinner size="small" color="white" /> : t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={edit.submitting}
                  onClick={cancelEdit}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-row">
          <span className="profile-row-label">{t('profile.language.label')}</span>
          <div className="profile-row-value-group">
            {/* Deliberately outside the edit state machine: a toggle needs no
                draft/submit/cancel cycle. LocaleProvider persists it. */}
            <LocaleToggle />
          </div>
        </div>
      </Card>

      <div className="profile-actions">
        <Button variant="secondary" size="medium" onClick={handleSignOut}>
          {t('nav.signOut')}
        </Button>
      </div>
    </div>
  );
}
