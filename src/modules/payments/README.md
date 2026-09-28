# Payments module (optional, switched off by default)

One-time purchases through **Stripe-hosted Checkout**. A user buys a product, and a webhook records an `Entitlement` that your code checks. No card data ever touches the app.

| Piece | Where |
|---|---|
| Product catalog, shared with the Lambda | `src/modules/payments/products.ts` |
| Checkout page `/checkout/:slug`, success page `/checkout/success` | `src/modules/payments/` |
| `createCheckoutSession` Lambda | `amplify/modules/payments/checkout/` |
| Stripe webhook (public Function URL) | `amplify/modules/payments/webhook/` |
| `Entitlement` model and mutation | `amplify/modules/payments/schema.ts` |
| The switch | `amplify/modules/payments/config.ts` (`PAYMENTS_ENABLED`) |

## Why it's off by default

Both Lambdas read Stripe keys with `secret()`. A backend that references a secret nobody has set **fails to deploy**. While the module is off, none of its resources exist, so a new project deploys with zero setup:
- no functions;
- no `Entitlement` table;
- no public URL;
- no routes.

The frontend doesn't keep a second flag. It checks the deployed schema: `isPaymentsEnabled()` in `enabled.ts`. The privacy policy and the account-deletion dialog add their payment disclosures only while payments are on.

## Switching it on

1. **Stripe:** create the product and a **price whose lookup key is the product slug** (e.g. `pro`), in test mode and again in live mode. The Lambda finds the price by that key, so no price ids are configured anywhere.
2. **Secrets.** For the sandbox run `npx ampx sandbox secret set STRIPE_SECRET_KEY`; for each branch, use Amplify console → Hosting → Secrets. Set `STRIPE_WEBHOOK_SECRET` to a placeholder for now; it gets its real value in step 4.
3. **Switch.** Set `PAYMENTS_ENABLED=true` for the branch (Amplify console → Environment variables), or in your shell before `npx ampx sandbox`. Also set `APP_ORIGIN` (e.g. `https://example.com`); it's the domain Stripe sends buyers back to.
4. **Webhook:**
   1. Deploy.
   2. Take `custom.stripeWebhookUrl` from `amplify_outputs.json`, or from the branch's deployed outputs.
   3. In Stripe, add an endpoint for that URL listening to `checkout.session.completed`.
   4. Set its signing secret as `STRIPE_WEBHOOK_SECRET` and redeploy.

   **Every branch has its own URL and needs its own endpoint.** An unregistered branch fails silently: the success page waits forever.
5. **Legal.** Review the payment copy in `src/i18n/messages/*/payments.ts` (the `legal` section), your terms of sale, and any consumer-law duties where you sell. The EU 14-day withdrawal right, for example, needs an explicit waiver before digital content is delivered.

Test with Stripe's test card `4242 4242 4242 4242`.

## Using it

```ts
const rows = await paymentService.listMyEntitlements(user.sub);
const hasPro = rows.some((row) => row.productSlug === 'pro');
```

Link to `/checkout/pro` to sell. To add a product:
- add it to `PRODUCTS`;
- add its copy in `copy.ts` (a compile error reminds you) and in both catalogs;
- create its Stripe price with the matching lookup key.

**Gate anything valuable server-side.** A client-side entitlement check hides UI; it doesn't protect anything. A Lambda that serves paid content must read `Entitlement` itself.

## Rules that must hold

- **Only the webhook writes `Entitlement`.** It's owner-*readable*, never client-writable, and the success page never grants from the URL.
- **The webhook verifies Stripe's signature over the raw body** (base64-decoded if needed) before reading anything.
- **It's idempotent** on the checkout session id, because Stripe delivers at least once.
- **Status codes are deliberate:**
  - 400 only for requests that aren't genuine deliveries;
  - 200 for genuine events it chooses to skip;
  - a thrown error (a 5xx) when a grant fails to write, so Stripe retries until the paid purchase is granted.
- **The client never sends an amount.** Stripe prices the session from the slug.
- **The buyer comes from the token**, never from arguments.
- **Entitlements survive account deletion** as proof of purchase (the deletion dialog says so). They hold only the pseudonymous sub.

## Removing this module

1. Delete `src/modules/payments/` and `amplify/modules/payments/`.
2. Delete `src/i18n/messages/{en,fr}/payments.ts` and the `payments` entries in both `index.ts` files.
3. Remove the payments lines from these files:
   - `amplify/data/resource.ts`
   - `amplify/backend.ts`
   - `src/App.tsx`
   - `src/pages/PrivacyPolicyPage.tsx`
   - `src/components/profile/DeleteAccountSection.tsx`
   - the "payments module on" step in `.github/workflows/pr-check.yml`
   - the `PURCHASE` kind in `amplify/functions/shared/notifications.ts`
4. Run `npm uninstall stripe`.
