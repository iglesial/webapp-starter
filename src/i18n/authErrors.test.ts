import { describe, expect, it } from 'vitest';
import { authErrorCopy } from './authErrors';
import { fr } from './messages/fr';
import { en } from './messages/en';

describe('authErrorCopy', () => {
  it('gives a context its own wording for the same code', () => {
    const confirmSignUp = authErrorCopy('confirmSignUp', 'VERIFICATION_CODE_EXPIRED');
    const confirmReset = authErrorCopy('confirmReset', 'VERIFICATION_CODE_EXPIRED');
    expect(confirmSignUp.body).not.toBe(confirmReset.body);
  });

  it('falls back to the context default for unhandled codes', () => {
    expect(authErrorCopy('signIn', 'NETWORK_ERROR')).toEqual(
      authErrorCopy('signIn', 'UNKNOWN_AUTH_ERROR'),
    );
  });

  // FR-009: an attacker must not be able to tell a registered email from an
  // unregistered one. Cognito maps both UserNotFoundException and
  // NotAuthorizedException to INVALID_CREDENTIALS; this asserts the rendered
  // copy is one single message, in every language.
  it('shows one indistinguishable message for failed sign-in credentials', () => {
    const { title, body } = authErrorCopy('signIn', 'INVALID_CREDENTIALS');
    expect(title).toBe('errors.auth.signIn.INVALID_CREDENTIALS.title');

    expect(fr.errors.auth.signIn.INVALID_CREDENTIALS.body).not.toMatch(
      /inconnu|introuvable|n’existe pas|mot de passe incorrect/i,
    );
    expect(en.errors.auth.signIn.INVALID_CREDENTIALS.body).not.toMatch(
      /not found|unknown|no account with|wrong password/i,
    );
    expect(body).toBe('errors.auth.signIn.INVALID_CREDENTIALS.body');
  });
});
