import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';
import Stripe from 'stripe';
import { client } from '../client';
import { throwOnErrors } from '../../../functions/shared/appsync';
import { notifyDiscord } from '../../../functions/shared/notify';
import { purchaseMessage } from '../../../functions/shared/notifications';
import { findProduct } from '../../../../src/modules/payments/products';

// Public Function URL receiving Stripe events. Authenticity is enforced by
// verifying Stripe's signature over the EXACT raw request bytes — never
// parse-then-restringify the body before verification.
//
// Per environment, and easy to miss: each branch gets its OWN Function URL, so
// the endpoint must be registered as a webhook in Stripe for that branch and
// its signing secret set as STRIPE_WEBHOOK_SECRET there. An unregistered
// environment fails silently — the Lambda is simply never invoked, and
// checkouts wait forever on the success page.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

async function alreadyGranted(sessionId: string): Promise<boolean> {
  const { data, errors } = await client.models.Entitlement.listEntitlementByStripeCheckoutSessionId(
    { stripeCheckoutSessionId: sessionId },
  );
  throwOnErrors(errors, 'idempotency lookup');
  return data.length > 0;
}

// Status codes matter: Stripe RETRIES any non-2xx for days. A 400 is only for
// requests that are not genuine Stripe deliveries (bad signature); anything
// genuine that we deliberately skip gets a 200, or Stripe would keep resending
// it. A thrown error (a failed write) becomes a 500 on purpose — that retry is
// what eventually grants a paid purchase.
export const handler = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  const signature = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret || !event.body) {
    return { statusCode: 400, body: 'Missing signature, secret, or body' };
  }

  // Function URLs may deliver the body base64-encoded; the signature is over
  // the raw bytes, so decode before verifying.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return { statusCode: 400, body: 'Invalid signature' };
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: `Ignored ${stripeEvent.type}` };
  }

  const session = stripeEvent.data.object;
  if (session.payment_status !== 'paid') {
    // Delayed payment methods complete later via
    // checkout.session.async_payment_succeeded — handle that event too before
    // enabling any. Never grant on an unpaid session.
    return { statusCode: 200, body: 'Session not paid yet — ignored' };
  }

  const userId = session.metadata?.userId;
  const productSlug = session.metadata?.productSlug;
  if (!userId || !productSlug || !findProduct(productSlug)) {
    console.error(`Session ${session.id} has missing or unknown userId/productSlug metadata`);
    return { statusCode: 200, body: 'Unusable metadata — ignored' };
  }

  // Stripe delivers at least once: a replay must not grant (or announce) twice.
  if (await alreadyGranted(session.id)) {
    return { statusCode: 200, body: 'Already granted (replay)' };
  }

  const { errors } = await client.models.Entitlement.create({
    userId,
    productSlug,
    stripeCheckoutSessionId: session.id,
    grantedAt: new Date().toISOString(),
  });
  throwOnErrors(errors, 'grant entitlement');

  console.log(`Entitlement granted: user ${userId}, product ${productSlug}, session ${session.id}`);
  await notifyDiscord(purchaseMessage(productSlug), 'PURCHASE');
  return { statusCode: 200, body: 'Entitlement granted' };
};
