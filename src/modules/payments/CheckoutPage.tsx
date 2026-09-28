import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../components/core/Alert';
import { Button } from '../../components/core/Button';
import { Card } from '../../components/core/Card';
import { Spinner } from '../../components/core/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { PAY_ERROR_KEY, PRODUCT_COPY } from './copy';
import { PaymentError, paymentService } from './paymentService';
import { findProduct, PAYMENT_ERROR_CODES, type PaymentErrorCode } from './products';
import './payments.css';

// /checkout/:slug — shows what is being bought, then hands over to Stripe's
// hosted Checkout. No card field ever touches this app.
export function CheckoutPage() {
  const { t } = useTranslation();
  const { formatPrice } = useLocale();
  const { user } = useAuth();
  const { slug = '' } = useParams();
  const product = findProduct(slug);

  const [owned, setOwned] = useState<boolean | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<PaymentErrorCode | null>(null);

  // Say so up front rather than after a click: the Lambda would refuse anyway.
  useEffect(() => {
    if (!product || !user) return;
    let cancelled = false;
    paymentService
      .listMyEntitlements(user.sub)
      .then((rows) => {
        if (!cancelled) setOwned(rows.some((row) => row.productSlug === product.slug));
      })
      .catch((err: unknown) => {
        // Not knowing is not a reason to block the purchase; the server checks.
        console.error('Could not load entitlements', err);
        if (!cancelled) setOwned(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product, user]);

  if (!product) {
    return (
      <main className="checkout-page">
        <Alert type="warning">{t('payments.checkout.notFound')}</Alert>
      </main>
    );
  }

  const copy = PRODUCT_COPY[product.slug];

  async function handleBuy() {
    if (!product) return;
    setRedirecting(true);
    setError(null);
    try {
      const url = await paymentService.createCheckoutSession(product.slug);
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof PaymentError ? err.code : PAYMENT_ERROR_CODES.unknown);
      setRedirecting(false);
    }
  }

  return (
    <main className="checkout-page">
      <h1>{t('payments.checkout.title')}</h1>
      <Card padding="large">
        <h2 className="checkout-product-name">{t(copy.name)}</h2>
        <p className="checkout-product-description">{t(copy.description)}</p>
        <p className="checkout-price">{formatPrice(product.priceCents, product.currency)}</p>

        {error && <Alert type="danger">{t(PAY_ERROR_KEY[error])}</Alert>}

        {owned === null ? (
          <Spinner size="small" />
        ) : owned ? (
          <Alert type="info">{t('payments.checkout.alreadyOwned')}</Alert>
        ) : (
          <Button
            variant="primary"
            size="large"
            fullWidth
            disabled={redirecting}
            onClick={() => void handleBuy()}
          >
            {redirecting ? t('payments.checkout.redirecting') : t('payments.checkout.buy')}
          </Button>
        )}
        <p className="checkout-secure">{t('payments.checkout.secure')}</p>
      </Card>
    </main>
  );
}
