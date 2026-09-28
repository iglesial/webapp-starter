import type { AppSyncResolverEvent } from 'aws-lambda';
import Stripe from 'stripe';
import { client } from '../client';
import type { PaymentsSchema } from '../schema';
import { fieldNameOf, identityOf, throwOnErrors } from '../../../functions/shared/appsync';
import { findProduct, PAYMENT_ERROR_CODES } from '../../../../src/modules/payments/products';

type CheckoutArgs = PaymentsSchema['createCheckoutSession']['args'];
type CheckoutResult = PaymentsSchema['createCheckoutSession']['returnType'];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

async function isEntitled(userId: string, productSlug: string): Promise<boolean> {
  const { data, errors } = await client.models.Entitlement.listEntitlementByUserIdAndProductSlug({
    userId,
    productSlug: { eq: productSlug },
  });
  throwOnErrors(errors, 'entitlement lookup');
  return data.length > 0;
}

// The Stripe price whose lookup key is the product slug. Resolved per call
// rather than configured, so the same code works in test and live mode: each
// mode holds its own price under the same lookup key.
async function priceIdFor(productSlug: string): Promise<string | undefined> {
  const prices = await stripe.prices.list({ lookup_keys: [productSlug], active: true, limit: 1 });
  return prices.data[0]?.id;
}

async function handleCreateCheckoutSession(
  event: AppSyncResolverEvent<CheckoutArgs>,
): Promise<CheckoutResult> {
  // From the token only; the arguments carry no user.
  const identity = identityOf(event);
  const { productSlug } = event.arguments;

  // Every check lives here, not in the UI: this mutation is
  // allow.authenticated() and callable directly.
  if (!findProduct(productSlug)) throw new Error(PAYMENT_ERROR_CODES.notFound);
  if (await isEntitled(identity.sub, productSlug)) {
    throw new Error(PAYMENT_ERROR_CODES.alreadyEntitled);
  }
  const priceId = await priceIdFor(productSlug);
  if (!priceId) throw new Error(PAYMENT_ERROR_CODES.notConfigured);

  const origin = process.env.APP_ORIGIN ?? 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: identity.sub,
    // The Entitlement is written by the webhook after payment, not here, so
    // who bought what has to travel with the session to survive the redirect.
    metadata: { userId: identity.sub, productSlug },
    // `product` tells the success page which grant to wait for.
    success_url: `${origin}/checkout/success?product=${encodeURIComponent(productSlug)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/${encodeURIComponent(productSlug)}`,
  });

  if (!session.url) throw new Error('Stripe returned no checkout URL');
  return { url: session.url };
}

export const handler = async (
  event: AppSyncResolverEvent<CheckoutArgs>,
): Promise<CheckoutResult> => {
  const fieldName = fieldNameOf(event);
  switch (fieldName) {
    case 'createCheckoutSession':
      return handleCreateCheckoutSession(event);
    default:
      throw new Error(`Unknown field: ${String(fieldName)}`);
  }
};
