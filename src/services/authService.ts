import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  resendSignUpCode,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updateUserAttributes,
} from 'aws-amplify/auth';
import type { AuthErrorCode, AuthResult, AuthUser } from '../types/auth';

interface AmplifyError {
  name?: string;
  message?: string;
}

function isAmplifyError(err: unknown): err is AmplifyError {
  return typeof err === 'object' && err !== null && ('name' in err || 'message' in err);
}

function mapError(err: unknown): { code: AuthErrorCode; amplifyName?: string } {
  if (!isAmplifyError(err)) return { code: 'UNKNOWN_AUTH_ERROR' };
  switch (err.name) {
    case 'UsernameExistsException':
      return { code: 'EMAIL_ALREADY_REGISTERED', amplifyName: err.name };
    // FR-009: both unknown email and wrong password must be indistinguishable.
    case 'UserNotFoundException':
    case 'NotAuthorizedException':
      return { code: 'INVALID_CREDENTIALS', amplifyName: err.name };
    case 'UserNotConfirmedException':
      return { code: 'USER_NOT_CONFIRMED', amplifyName: err.name };
    case 'CodeMismatchException':
      return { code: 'VERIFICATION_CODE_INVALID', amplifyName: err.name };
    case 'ExpiredCodeException':
      return { code: 'VERIFICATION_CODE_EXPIRED', amplifyName: err.name };
    case 'InvalidPasswordException':
      return { code: 'PASSWORD_DOES_NOT_MEET_POLICY', amplifyName: err.name };
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return { code: 'RATE_LIMITED_TRY_LATER', amplifyName: err.name };
    case 'NetworkError':
      return { code: 'NETWORK_ERROR', amplifyName: err.name };
    default:
      return { code: 'UNKNOWN_AUTH_ERROR', amplifyName: err.name };
  }
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export async function signUpWithDisplayName({
  email,
  password,
  displayName,
}: SignUpInput): Promise<AuthResult> {
  try {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          nickname: displayName,
        },
      },
    });
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}

export async function confirmSignUpWithCode(
  email: string,
  code: string,
): Promise<AuthResult> {
  try {
    await confirmSignUp({ username: email, confirmationCode: code });
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}

export async function resendConfirmationCode(email: string): Promise<AuthResult> {
  try {
    await resendSignUpCode({ username: email });
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}

export async function signInWithCredentials(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    await signIn({ username: email, password });
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}

export async function signOutCurrentUser(): Promise<AuthResult> {
  try {
    await signOut();
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}

/**
 * FR-012: always report success to avoid account enumeration. UserNotFoundException
 * is silently rewritten to ok:true so the UI cannot distinguish registered from
 * unregistered addresses.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    await resetPassword({ username: email });
    return { ok: true, value: undefined };
  } catch (err) {
    const mapped = mapError(err);
    if (mapped.amplifyName === 'UserNotFoundException') {
      return { ok: true, value: undefined };
    }
    return { ok: false, ...mapped };
  }
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<AuthResult> {
  try {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens) return null;
    const attrs = await fetchUserAttributes();
    const sub = attrs.sub ?? session.tokens.idToken?.payload.sub;
    if (typeof sub !== 'string') return null;
    const rawGroups = session.tokens.idToken?.payload['cognito:groups'];
    const groups = Array.isArray(rawGroups)
      ? rawGroups.filter((g): g is string => typeof g === 'string')
      : [];
    return {
      sub,
      email: attrs.email ?? '',
      displayName: attrs.nickname ?? '',
      emailVerified: attrs.email_verified === 'true',
      groups,
    };
  } catch {
    return null;
  }
}

export async function updateDisplayName(displayName: string): Promise<AuthResult> {
  try {
    await updateUserAttributes({ userAttributes: { nickname: displayName } });
    return { ok: true, value: undefined };
  } catch (err) {
    return { ok: false, ...mapError(err) };
  }
}
