import type { MessageKey } from './authErrors';
import type { AccountErrorCode } from '../utils/accountErrors';

// Coded service errors → catalog keys. Typing each map as
// Record<Code, MessageKey> means adding a code is a compile error until copy
// exists for it — which rendering `err.message` could never catch. Add one map
// per service error family (payments, uploads…) following this one.
export const ACCOUNT_ERROR_KEY: Record<AccountErrorCode, MessageKey> = {
  ACCOUNT_DELETE_FAILED: 'errors.account.ACCOUNT_DELETE_FAILED',
};
