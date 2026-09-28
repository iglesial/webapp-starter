import { Amplify } from 'aws-amplify';

// The backend is the switch (PAYMENTS_ENABLED at synth time); the frontend
// reads the result from amplify_outputs.json instead of keeping a second flag
// that could disagree with it.
//
// Its own file, and the only one App.tsx imports eagerly: paymentService pulls
// in the AppSync data client, which belongs in the lazy checkout chunks, not
// the main bundle.
export function isPaymentsEnabled(): boolean {
  const introspection = Amplify.getConfig().API?.GraphQL?.modelIntrospection as
    | { mutations?: Record<string, unknown> }
    | undefined;
  return Boolean(introspection?.mutations?.createCheckoutSession);
}
