import { a, type ClientSchema } from '@aws-amplify/backend';
import { checkout } from './checkout/resource';

// The payments module's slice of the data schema, spread into a.schema() in
// amplify/data/resource.ts when PAYMENTS_ENABLED.
export const paymentsSchema = {
  // Granted EXCLUSIVELY by the webhook after a paid checkout; users can only
  // read their own. Never make this client-writable: an Entitlement is worth
  // exactly what the product costs. The checkout session id makes webhook
  // replays idempotent.
  Entitlement: a
    .model({
      userId: a.string().required(), // Cognito sub, from the checkout metadata
      productSlug: a.string().required(),
      stripeCheckoutSessionId: a.string().required(),
      grantedAt: a.datetime().required(),
    })
    // The webhook stores the bare sub, so the owner claim must be the bare
    // sub too — stated explicitly rather than relying on a default.
    .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read'])])
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['productSlug']),
      index('stripeCheckoutSessionId'),
    ]),

  CheckoutSessionResult: a.customType({
    url: a.string().required(),
  }),

  // The price is looked up server-side from the slug; the client never sends
  // an amount. Callable directly (allow.authenticated()), so every check lives
  // in the Lambda, not the UI.
  createCheckoutSession: a
    .mutation()
    .arguments({ productSlug: a.string().required() })
    .returns(a.ref('CheckoutSessionResult'))
    .handler(a.handler.function(checkout))
    .authorization((allow) => [allow.authenticated()]),
};

// Standalone schema whose only job is its TYPE: the module's frontend and
// Lambdas are typed against it, so they compile whether or not the module is
// switched on in the app schema.
// Exported only so lint sees it used; nothing consumes it at runtime.
export const paymentsOnlySchema = a.schema(paymentsSchema);
export type PaymentsSchema = ClientSchema<typeof paymentsOnlySchema>;
