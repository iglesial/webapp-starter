import { defineFunction } from '@aws-amplify/backend';

// Cognito post-confirmation trigger: the only place that knows a new account
// has actually been created (rather than merely started). Notifies Discord and
// does nothing else — a natural place to add "on sign-up" work later.
//
// It runs INSIDE the sign-up path, so it must never fail: a throw here would
// stop confirmation and leave someone unable to finish creating their account.
export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  // One outbound POST with a 3s timeout, plus cold start.
  timeoutSeconds: 15,
  // NOT the default 'function' group, and this is load-bearing. Functions land
  // in a shared nested stack, and some of them depend on auth (the account
  // function takes USER_POOL_ID and a userPoolArn policy). A trigger in that
  // stack makes auth depend on it right back, and the deploy fails with
  // "Circular dependency between resources". Grouping the trigger WITH auth
  // keeps the edge one-directional. `npm run synth` catches this locally.
  resourceGroupName: 'auth',
});
