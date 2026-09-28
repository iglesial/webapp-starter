import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../core/Alert';
import { Button } from '../core/Button';
import { Checkbox } from '../core/Checkbox';
import { Modal } from '../core/Modal';
import { useAuth } from '../../hooks/useAuth';
import { accountService } from '../../services/data/accountService';
import { ACCOUNT_ERROR_KEY } from '../../i18n/serviceErrors';
import './DeleteAccountSection.css';

// Self-service account deletion (GDPR right to erasure). The dialog says what
// is erased before anything can be confirmed, and the delete button stays
// disabled until the user ticks an explicit confirmation.
export function DeleteAccountSection() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!user) return null;

  function openDialog() {
    setOpen(true);
    setConfirmed(false);
    setFailed(false);
  }

  function closeDialog() {
    if (busy) return;
    setOpen(false);
  }

  async function handleDelete() {
    setBusy(true);
    setFailed(false);
    try {
      await accountService.deleteMyAccount();
    } catch {
      setFailed(true);
      setBusy(false);
      return;
    }
    // Leave the protected page BEFORE signing out, or the route guard sends
    // a just-deleted user to the sign-in page. HomePage reads the state to
    // confirm the deletion.
    navigate('/', { replace: true, state: { accountDeleted: true } });
    await signOut();
  }

  return (
    <section className="delete-account" aria-labelledby="delete-account-heading">
      <h2 id="delete-account-heading" className="delete-account-heading">
        {t('account.heading')}
      </h2>
      <p className="delete-account-intro">{t('account.intro')}</p>
      <Button variant="danger" size="medium" onClick={openDialog}>
        {t('account.open')}
      </Button>

      <Modal isOpen={open} onClose={closeDialog} title={t('account.dialogTitle')}>
        <div className="delete-account-dialog">
          <p>{t('account.deletedList')}</p>

          {failed && <Alert type="danger">{t(ACCOUNT_ERROR_KEY.ACCOUNT_DELETE_FAILED)}</Alert>}

          <Checkbox
            checked={confirmed}
            onChange={setConfirmed}
            disabled={busy}
            label={t('account.confirm')}
          />

          <div className="delete-account-actions">
            <Button variant="secondary" onClick={closeDialog} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDelete()}
              disabled={!confirmed || busy}
            >
              {busy ? t('account.deleting') : t('account.submit')}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
