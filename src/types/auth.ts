import type { Locale } from '../i18n/locale';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

export interface AuthUser {
  sub: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  locale: Locale | null;
  groups: string[];
}

export type AuthErrorCode =
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_CONFIRMED'
  | 'VERIFICATION_CODE_INVALID'
  | 'VERIFICATION_CODE_EXPIRED'
  | 'PASSWORD_DOES_NOT_MEET_POLICY'
  | 'RATE_LIMITED_TRY_LATER'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_AUTH_ERROR';

export type AuthFailure = { ok: false; code: AuthErrorCode; amplifyName?: string };
export type AuthSuccess<T = void> = { ok: true; value: T };

export type AuthResult<T = void> = AuthSuccess<T> | AuthFailure;

export function isAuthFailure<T>(r: AuthResult<T>): r is AuthFailure {
  return r.ok === false;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
