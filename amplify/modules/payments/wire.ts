import { FunctionUrlAuthType, type IFunction } from 'aws-cdk-lib/aws-lambda';

// What wirePayments needs from the backend — structural, so this module does
// not depend on the exact shape of the app's defineBackend() call.
interface FunctionHandle {
  resources: { lambda: IFunction };
  addEnvironment: (name: string, value: string) => void;
}

export interface PaymentsBackend {
  checkout: FunctionHandle;
  stripeWebhook: FunctionHandle;
  addOutput: (output: { custom: Record<string, string> }) => void;
}

// Everything the payments module adds to backend.ts once it is switched on.
export function wirePayments(backend: PaymentsBackend, discordEnv: Record<string, string>): void {
  // Origin for the Stripe Checkout success/cancel URLs. Sandbox defaults to the
  // Vite dev server; each branch sets APP_ORIGIN (e.g. https://example.com) as
  // an Amplify branch environment variable, read here at synth time.
  backend.checkout.addEnvironment('APP_ORIGIN', process.env.APP_ORIGIN ?? 'http://localhost:5173');

  // Purchase notifications, same rules as sign-up ones (see notify.ts).
  for (const [name, value] of Object.entries(discordEnv)) {
    backend.stripeWebhook.addEnvironment(name, value);
  }

  // Public HTTPS endpoint for Stripe to deliver events to. Authenticity is
  // enforced by signature verification inside the handler
  // (STRIPE_WEBHOOK_SECRET), not by IAM — Stripe cannot sign SigV4 requests.
  const webhookUrl = backend.stripeWebhook.resources.lambda.addFunctionUrl({
    authType: FunctionUrlAuthType.NONE,
  });
  // Surfaces the URL in amplify_outputs.json (custom.stripeWebhookUrl) so it
  // can be pasted into the Stripe dashboard. Each branch has its OWN URL and
  // needs its own Stripe endpoint + signing secret.
  backend.addOutput({ custom: { stripeWebhookUrl: webhookUrl.url } });
}
