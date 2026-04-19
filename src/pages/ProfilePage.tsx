import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/core/Alert';
import { Button } from '../components/core/Button';
import { Card } from '../components/core/Card';
import { FormField } from '../components/core/FormField';
import { Input } from '../components/core/Input';
import { Spinner } from '../components/core/Spinner';
import { useAuth } from '../hooks/useAuth';
import { updateDisplayName } from '../services/authService';
import { isAuthFailure } from '../types/auth';
import {
  displayNameErrorMessage,
  isDisplayNameInvalid,
  validateDisplayName,
} from '../utils/validation';
import './ProfilePage.css';

type EditState =
  | { mode: 'view' }
  | { mode: 'edit'; draft: string; error?: string; submitting: boolean };

export function ProfilePage() {
  const { user, refreshUser, signOut } = useAuth();
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
      setEdit({ ...edit, error: displayNameErrorMessage(check.reason) });
      return;
    }
    setEdit({ ...edit, error: undefined, submitting: true });
    const result = await updateDisplayName(check.value);
    if (isAuthFailure(result)) {
      setEdit({ mode: 'edit', draft: edit.draft, submitting: false });
      setSaveError('Could not save your display name. Please try again.');
      return;
    }
    await refreshUser();
    setEdit({ mode: 'view' });
    setSaveOk('Display name updated.');
  }

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <h1 className="profile-page-title">Your profile</h1>
        <p className="profile-page-subtitle">Identity and account settings.</p>
      </header>

      {saveOk && (
        <Alert type="success" title="Saved">
          {saveOk}
        </Alert>
      )}
      {saveError && (
        <Alert type="danger" title="Save failed">
          {saveError}
        </Alert>
      )}

      <Card padding="large" className="profile-card">
        <div className="profile-row">
          <span className="profile-row-label">Email</span>
          <span className="profile-row-value">{user.email}</span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">Display name</span>
          {edit.mode === 'view' ? (
            <div className="profile-row-value-group">
              <span className="profile-row-value">{user.displayName}</span>
              <Button variant="secondary" size="small" onClick={beginEdit}>
                Edit
              </Button>
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={submitEdit} noValidate>
              <FormField
                label="New display name"
                htmlFor="profile-display-name"
                error={edit.error}
                helper="3–30 characters. Not unique."
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
                  {edit.submitting ? <Spinner size="small" color="white" /> : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={edit.submitting}
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      <div className="profile-actions">
        <Button variant="secondary" size="medium" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
