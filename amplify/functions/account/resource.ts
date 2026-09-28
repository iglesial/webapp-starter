import { defineFunction } from '@aws-amplify/backend';

// Self-service account deletion. Its own function, not a field on some other
// one, so that the genuinely dangerous permission — deleting Cognito users —
// lives on a Lambda that does nothing else. USER_POOL_ID and the
// AdminDeleteUser grant are added in backend.ts.
export const account = defineFunction({
  name: 'account',
  entry: './handler.ts',
  // Paginated lists and one delete per row; generous so a long-lived account
  // does not time out halfway. A timeout is recoverable anyway: the handler is
  // safe to run again.
  timeoutSeconds: 60,
});
