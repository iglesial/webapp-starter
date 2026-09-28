import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../components/core/Alert';
import { Spinner } from '../../components/core/Spinner';
import { AFTER_SIGN_IN_PATH } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { paymentService } from './paymentService';
import './payments.css';

// Stripe redirects here BEFORE the webhook has necessarily run, so arriving
// proves nothing: the page polls until an entitlement to the product just
// bought appears. Nothing in the URL grants anything — only the webhook
// writes Entitlements. Polling for THAT product is a sound signal because the
// checkout Lambda refuses to sell a product the user already owns.
export const POLL_INTERVAL_MS = 2_000;
export const POLL_ATTEMPTS = 15; // ~30 s, far longer than a healthy webhook takes

type State = 'activating' | 'done' | 'slow';

export function CheckoutSuccessPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const productSlug = params.get('product');
  const [state, setState] = useState<State>('activating');

  useEffect(() => {
    if (!user || !productSlug) return;
    const sub = user.sub;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    async function poll() {
      attempts += 1;
      try {
        const rows = await paymentService.listMyEntitlements(sub);
        if (cancelled) return;
        if (rows.some((row) => row.productSlug === productSlug)) {
          setState('done');
          return;
        }
      } catch (err) {
        console.error('Could not check entitlements', err);
      }
      if (cancelled) return;
      if (attempts >= POLL_ATTEMPTS) setState('slow');
      else timer = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
    }

    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user, productSlug]);

  // No product in the URL: nothing to wait for. Say the neutral thing.
  const shown: State = productSlug ? state : 'slow';

  return (
    <main className="checkout-page">
      <h1>{t('payments.success.title')}</h1>
      {shown === 'activating' && (
        <div className="checkout-activating" aria-busy="true">
          <Spinner size="small" /> {t('payments.success.activating')}
        </div>
      )}
      {shown === 'done' && <Alert type="success">{t('payments.success.done')}</Alert>}
      {shown === 'slow' && <Alert type="warning">{t('payments.success.slow')}</Alert>}
      {shown !== 'activating' && (
        <Link to={AFTER_SIGN_IN_PATH} className="btn btn-primary btn-medium checkout-continue">
          {t('payments.success.continue')}
        </Link>
      )}
    </main>
  );
}
