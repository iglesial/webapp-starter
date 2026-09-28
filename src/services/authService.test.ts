/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
import {
  confirmPasswordReset,
  confirmSignUpWithCode,
  fetchCurrentUser,
  requestPasswordReset,
  resendConfirmationCode,
  signInWithCredentials,
  signOutCurrentUser,
  signUpWithDisplayName,
  updateDisplayName,
  updateLocale,
} from './authService';

vi.mock('aws-amplify/auth', () => ({
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  resendSignUpCode: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  confirmResetPassword: vi.fn(),
  fetchAuthSession: vi.fn(),
  fetchUserAttributes: vi.fn(),
  updateUserAttributes: vi.fn(),
}));

class AmplifyErr extends Error {
  constructor(name: string) {
    super(name);
    this.name = name;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signUpWithDisplayName', () => {
  it('passes email + password + nickname to aws-amplify signUp and returns ok', async () => {
    vi.mocked(signUp).mockResolvedValue({
        isSignUpComplete: false,
    } as any);
    const result = await signUpWithDisplayName({
      email: 'a@b.co',
      password: 'Passw0rd!!',
      displayName: 'Alice',
    });
    expect(result).toEqual({ ok: true, value: undefined });
    expect(signUp).toHaveBeenCalledWith({
      username: 'a@b.co',
      password: 'Passw0rd!!',
      options: { userAttributes: { email: 'a@b.co', nickname: 'Alice' } },
    });
  });

  it('maps UsernameExistsException to EMAIL_ALREADY_REGISTERED', async () => {
    vi.mocked(signUp).mockRejectedValue(new AmplifyErr('UsernameExistsException'));
    const result = await signUpWithDisplayName({
      email: 'a@b.co',
      password: 'Passw0rd!',
      displayName: 'Alice',
    });
    expect(result).toEqual({
      ok: false,
      code: 'EMAIL_ALREADY_REGISTERED',
      amplifyName: 'UsernameExistsException',
    });
  });

  it('maps InvalidPasswordException to PASSWORD_DOES_NOT_MEET_POLICY', async () => {
    vi.mocked(signUp).mockRejectedValue(new AmplifyErr('InvalidPasswordException'));
    const result = await signUpWithDisplayName({
      email: 'a@b.co',
      password: 'weak',
      displayName: 'Alice',
    });
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('PASSWORD_DOES_NOT_MEET_POLICY');
  });
});

describe('confirmSignUpWithCode', () => {
  it('returns ok on successful confirmation', async () => {
    vi.mocked(confirmSignUp).mockResolvedValue({ isSignUpComplete: true } as any);
    const result = await confirmSignUpWithCode('a@b.co', '123456');
    expect(result.ok).toBe(true);
    expect(confirmSignUp).toHaveBeenCalledWith({
      username: 'a@b.co',
      confirmationCode: '123456',
    });
  });

  it('maps CodeMismatchException to VERIFICATION_CODE_INVALID', async () => {
    vi.mocked(confirmSignUp).mockRejectedValue(new AmplifyErr('CodeMismatchException'));
    const result = await confirmSignUpWithCode('a@b.co', 'bad');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('VERIFICATION_CODE_INVALID');
  });

  it('maps ExpiredCodeException to VERIFICATION_CODE_EXPIRED', async () => {
    vi.mocked(confirmSignUp).mockRejectedValue(new AmplifyErr('ExpiredCodeException'));
    const result = await confirmSignUpWithCode('a@b.co', 'old');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('VERIFICATION_CODE_EXPIRED');
  });
});

describe('resendConfirmationCode', () => {
  it('returns ok on successful resend', async () => {
    vi.mocked(resendSignUpCode).mockResolvedValue({} as any);
    const result = await resendConfirmationCode('a@b.co');
    expect(result.ok).toBe(true);
    expect(resendSignUpCode).toHaveBeenCalledWith({ username: 'a@b.co' });
  });
});

describe('signInWithCredentials — anti-enumeration (FR-009)', () => {
  it('maps UserNotFoundException to INVALID_CREDENTIALS', async () => {
    vi.mocked(signIn).mockRejectedValue(new AmplifyErr('UserNotFoundException'));
    const result = await signInWithCredentials('ghost@b.co', 'x');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('INVALID_CREDENTIALS');
  });

  it('maps NotAuthorizedException to INVALID_CREDENTIALS (same code as UserNotFoundException)', async () => {
    vi.mocked(signIn).mockRejectedValue(new AmplifyErr('NotAuthorizedException'));
    const result = await signInWithCredentials('a@b.co', 'wrong');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('INVALID_CREDENTIALS');
  });

  it('maps UserNotConfirmedException to USER_NOT_CONFIRMED (distinct from invalid credentials)', async () => {
    vi.mocked(signIn).mockRejectedValue(new AmplifyErr('UserNotConfirmedException'));
    const result = await signInWithCredentials('a@b.co', 'x');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('USER_NOT_CONFIRMED');
  });

  it('returns ok on success', async () => {
    vi.mocked(signIn).mockResolvedValue({ isSignedIn: true } as any);
    const result = await signInWithCredentials('a@b.co', 'good');
    expect(result.ok).toBe(true);
  });
});

describe('signOutCurrentUser', () => {
  it('returns ok on success', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    const result = await signOutCurrentUser();
    expect(result.ok).toBe(true);
  });
});

describe('requestPasswordReset — anti-enumeration (FR-012)', () => {
  it('returns ok on a registered email', async () => {
    vi.mocked(resetPassword).mockResolvedValue({} as any);
    const result = await requestPasswordReset('a@b.co');
    expect(result.ok).toBe(true);
  });

  it('returns ok on UserNotFoundException (does NOT reveal unregistered state)', async () => {
    vi.mocked(resetPassword).mockRejectedValue(new AmplifyErr('UserNotFoundException'));
    const result = await requestPasswordReset('ghost@b.co');
    expect(result.ok).toBe(true);
  });

  it('surfaces other Amplify errors (not absorbed)', async () => {
    vi.mocked(resetPassword).mockRejectedValue(new AmplifyErr('LimitExceededException'));
    const result = await requestPasswordReset('a@b.co');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('RATE_LIMITED_TRY_LATER');
  });
});

describe('confirmPasswordReset', () => {
  it('returns ok on success', async () => {
    vi.mocked(confirmResetPassword).mockResolvedValue(undefined);
    const result = await confirmPasswordReset('a@b.co', '123456', 'Passw0rd!!');
    expect(result.ok).toBe(true);
    expect(confirmResetPassword).toHaveBeenCalledWith({
      username: 'a@b.co',
      confirmationCode: '123456',
      newPassword: 'Passw0rd!!',
    });
  });

  it('maps InvalidPasswordException to PASSWORD_DOES_NOT_MEET_POLICY', async () => {
    vi.mocked(confirmResetPassword).mockRejectedValue(new AmplifyErr('InvalidPasswordException'));
    const result = await confirmPasswordReset('a@b.co', '123456', 'weak');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('PASSWORD_DOES_NOT_MEET_POLICY');
  });
});

describe('fetchCurrentUser', () => {
  it('returns null when no session tokens', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined } as any);
    const user = await fetchCurrentUser();
    expect(user).toBeNull();
  });

  it('returns null when fetchAuthSession rejects', async () => {
    vi.mocked(fetchAuthSession).mockRejectedValue(new Error('offline'));
    const user = await fetchCurrentUser();
    expect(user).toBeNull();
  });

  it('returns populated AuthUser when session + attributes resolve', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: { idToken: { payload: { sub: 'sub-1' } } as any } as any,
    });
    vi.mocked(fetchUserAttributes).mockResolvedValue({
      sub: 'sub-1',
      email: 'a@b.co',
      nickname: 'Alice',
      email_verified: 'true',
      } as any);
    const user = await fetchCurrentUser();
    expect(user).toEqual({
      sub: 'sub-1',
      email: 'a@b.co',
      displayName: 'Alice',
      emailVerified: true,
      locale: null,
      groups: [],
    });
  });

  it('reads a saved language preference, ignoring unsupported values', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: { idToken: { payload: { sub: 'sub-1' } } as any } as any,
    });
    vi.mocked(fetchUserAttributes).mockResolvedValue({
      sub: 'sub-1',
      email: 'a@b.co',
      nickname: 'Alice',
      email_verified: 'true',
      locale: 'fr',
    } as any);
    expect((await fetchCurrentUser())?.locale).toBe('fr');

    vi.mocked(fetchUserAttributes).mockResolvedValue({
      sub: 'sub-1',
      email: 'a@b.co',
      nickname: 'Alice',
      email_verified: 'true',
      locale: 'de',
    } as any);
    expect((await fetchCurrentUser())?.locale).toBeNull();
  });
});

describe('updateLocale', () => {
  it('calls updateUserAttributes with the standard locale attribute', async () => {
    vi.mocked(updateUserAttributes).mockResolvedValue({} as never);

    const result = await updateLocale('fr');

    expect(updateUserAttributes).toHaveBeenCalledWith({ userAttributes: { locale: 'fr' } });
    expect(result.ok).toBe(true);
  });

  it('maps failures like the other auth calls', async () => {
    vi.mocked(updateUserAttributes).mockRejectedValue(new Error('boom'));

    const result = await updateLocale('en');

    expect(result.ok).toBe(false);
  });
});

describe('updateDisplayName', () => {
  it('calls updateUserAttributes with nickname', async () => {
    vi.mocked(updateUserAttributes).mockResolvedValue({} as any);
    const result = await updateDisplayName('Bob');
    expect(result.ok).toBe(true);
    expect(updateUserAttributes).toHaveBeenCalledWith({
      userAttributes: { nickname: 'Bob' },
    });
  });

  it('maps errors like the rest of the service', async () => {
    vi.mocked(updateUserAttributes).mockRejectedValue(new AmplifyErr('LimitExceededException'));
    const result = await updateDisplayName('Bob');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('RATE_LIMITED_TRY_LATER');
  });
});

describe('unknown error mapping', () => {
  it('maps unrecognized error names to UNKNOWN_AUTH_ERROR but preserves the name', async () => {
    vi.mocked(signIn).mockRejectedValue(new AmplifyErr('SomethingWeirdException'));
    const result = await signInWithCredentials('a@b.co', 'x');
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('UNKNOWN_AUTH_ERROR');
      expect(result.amplifyName).toBe('SomethingWeirdException');
    }
  });

  it('returns UNKNOWN_AUTH_ERROR for non-Error rejections', async () => {
    vi.mocked(signIn).mockRejectedValue('plain string');
    const result = await signInWithCredentials('a@b.co', 'x');
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.code).toBe('UNKNOWN_AUTH_ERROR');
  });
});
