import { defineFunction, secret } from '@aws-amplify/backend';

// Receives Stripe events on a public Function URL and grants Entitlements.
// Its URL is exported as custom.stripeWebhookUrl in amplify_outputs.json.
export const stripeWebhook = defineFunction({
  name: 'payments-webhook',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    // Signing secret of the Stripe webhook endpoint that points at THIS
    // environment's Function URL (created in Stripe after the first deploy).
    STRIPE_WEBHOOK_SECRET: secret('STRIPE_WEBHOOK_SECRET'),
  },
});
