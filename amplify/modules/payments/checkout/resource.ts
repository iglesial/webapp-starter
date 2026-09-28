import { defineFunction, secret } from '@aws-amplify/backend';

// createCheckoutSession: turns "I want product X" into a hosted Stripe
// Checkout URL. Grants nothing — only the webhook, after Stripe confirms
// payment, writes an Entitlement.
export const checkout = defineFunction({
  name: 'payments-checkout',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    // Restricted Stripe secret key. Sandbox:
    //   npx ampx sandbox secret set STRIPE_SECRET_KEY
    // Branches: Amplify console → Hosting → Secrets. Never in the repo.
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    // APP_ORIGIN (the success/cancel URLs) is added in wire.ts, where the
    // per-branch value is available at synth time.
  },
});
