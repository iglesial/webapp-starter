import type { ParseKeys } from 'i18next';
import type { AuthErrorCode } from '../types/auth';

// One table replacing the copy maps each auth page used to carry.
//
// Entries hold translation KEYS, typed as ParseKeys — so every key below is
// checked against the catalogs at build time, and a context missing an entry
// is a compile error rather than a blank alert at runtime.
//
// The context dimension is deliberate: the same code needs different wording
// per page (an expired code says "request a new code" on confirm-sign-up but
// "request a new reset code below" on confirm-reset).
export type MessageKey = ParseKeys<'translation'>;

export type AuthCopyContext =
  | 'signIn'
  | 'signUp'
  | 'confirmSignUp'
  | 'forgotPassword'
  | 'confirmReset';

export interface AuthCopy {
  title: MessageKey;
  body: MessageKey;
}

type ContextCopy = Partial<Record<AuthErrorCode, AuthCopy>> & { default: AuthCopy };

const AUTH_ERROR_COPY: Record<AuthCopyContext, ContextCopy> = {
  signIn: {
    // FR-009: INVALID_CREDENTIALS must read identically whether the email is
    // unknown or the password is wrong — never split it into two cases.
    INVALID_CREDENTIALS: {
      title: 'errors.auth.signIn.INVALID_CREDENTIALS.title',
      body: 'errors.auth.signIn.INVALID_CREDENTIALS.body',
    },
    RATE_LIMITED_TRY_LATER: {
      title: 'errors.auth.signIn.RATE_LIMITED_TRY_LATER.title',
      body: 'errors.auth.signIn.RATE_LIMITED_TRY_LATER.body',
    },
    default: {
      title: 'errors.auth.signIn.default.title',
      body: 'errors.auth.signIn.default.body',
    },
  },
  signUp: {
    EMAIL_ALREADY_REGISTERED: {
      title: 'errors.auth.signUp.EMAIL_ALREADY_REGISTERED.title',
      body: 'errors.auth.signUp.EMAIL_ALREADY_REGISTERED.body',
    },
    PASSWORD_DOES_NOT_MEET_POLICY: {
      title: 'errors.auth.signUp.PASSWORD_DOES_NOT_MEET_POLICY.title',
      body: 'errors.auth.signUp.PASSWORD_DOES_NOT_MEET_POLICY.body',
    },
    RATE_LIMITED_TRY_LATER: {
      title: 'errors.auth.signUp.RATE_LIMITED_TRY_LATER.title',
      body: 'errors.auth.signUp.RATE_LIMITED_TRY_LATER.body',
    },
    default: {
      title: 'errors.auth.signUp.default.title',
      body: 'errors.auth.signUp.default.body',
    },
  },
  confirmSignUp: {
    VERIFICATION_CODE_INVALID: {
      title: 'errors.auth.confirmSignUp.VERIFICATION_CODE_INVALID.title',
      body: 'errors.auth.confirmSignUp.VERIFICATION_CODE_INVALID.body',
    },
    VERIFICATION_CODE_EXPIRED: {
      title: 'errors.auth.confirmSignUp.VERIFICATION_CODE_EXPIRED.title',
      body: 'errors.auth.confirmSignUp.VERIFICATION_CODE_EXPIRED.body',
    },
    default: {
      title: 'errors.auth.confirmSignUp.default.title',
      body: 'errors.auth.confirmSignUp.default.body',
    },
  },
  forgotPassword: {
    RATE_LIMITED_TRY_LATER: {
      title: 'errors.auth.forgotPassword.RATE_LIMITED_TRY_LATER.title',
      body: 'errors.auth.forgotPassword.RATE_LIMITED_TRY_LATER.body',
    },
    default: {
      title: 'errors.auth.forgotPassword.default.title',
      body: 'errors.auth.forgotPassword.default.body',
    },
  },
  confirmReset: {
    VERIFICATION_CODE_INVALID: {
      title: 'errors.auth.confirmReset.VERIFICATION_CODE_INVALID.title',
      body: 'errors.auth.confirmReset.VERIFICATION_CODE_INVALID.body',
    },
    VERIFICATION_CODE_EXPIRED: {
      title: 'errors.auth.confirmReset.VERIFICATION_CODE_EXPIRED.title',
      body: 'errors.auth.confirmReset.VERIFICATION_CODE_EXPIRED.body',
    },
    PASSWORD_DOES_NOT_MEET_POLICY: {
      title: 'errors.auth.confirmReset.PASSWORD_DOES_NOT_MEET_POLICY.title',
      body: 'errors.auth.confirmReset.PASSWORD_DOES_NOT_MEET_POLICY.body',
    },
    RATE_LIMITED_TRY_LATER: {
      title: 'errors.auth.confirmReset.RATE_LIMITED_TRY_LATER.title',
      body: 'errors.auth.confirmReset.RATE_LIMITED_TRY_LATER.body',
    },
    default: {
      title: 'errors.auth.confirmReset.default.title',
      body: 'errors.auth.confirmReset.default.body',
    },
  },
};

export function authErrorCopy(context: AuthCopyContext, code: AuthErrorCode): AuthCopy {
  return AUTH_ERROR_COPY[context][code] ?? AUTH_ERROR_COPY[context].default;
}
