import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSyncResolverEvent } from 'aws-lambda';

// Deleting an account is irreversible, so these tests pin what must never go
// wrong: WHOSE data is deleted, and the ORDER — Cognito last, and never if
// anything before it failed.

const mocks = vi.hoisted(() => ({
  calls: [] as string[],
  cognitoSend: vi.fn(),
  cleanup: vi.fn(),
}));

vi.mock('./client', () => ({ client: { models: {} } }));

vi.mock('@aws-sdk/client-cognito-identity-provider', () => {
  class UserNotFoundException extends Error {}
  return {
    UserNotFoundException,
    AdminDeleteUserCommand: class {
      constructor(readonly input: unknown) {}
    },
    CognitoIdentityProviderClient: class {
      send = mocks.cognitoSend;
    },
  };
});

const { handler } = await import('./handler');
const { ACCOUNT_CLEANUPS } = await import('./deleteAccountData');
const { UserNotFoundException } = await import('@aws-sdk/client-cognito-identity-provider');

// Stands in for a per-user model registered by an app built on the template.
ACCOUNT_CLEANUPS.push({ name: 'Note', run: mocks.cleanup });

function event(identity: unknown, args: Record<string, unknown> = {}) {
  return {
    identity,
    arguments: args,
    info: { fieldName: 'deleteMyAccount' },
  } as unknown as AppSyncResolverEvent<unknown>;
}

const alice = { sub: 'sub-alice', username: 'alice-username' };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.calls.length = 0;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  mocks.cleanup.mockImplementation(async () => {
    mocks.calls.push('cleanup');
    return 3;
  });
  mocks.cognitoSend.mockImplementation(async () => {
    mocks.calls.push('cognito');
  });
});

describe('deleteMyAccount — whose data', () => {
  it('uses the token identity, and ignores any id passed as an argument', async () => {
    await handler(event(alice, { sub: 'sub-mallory', username: 'mallory' }));

    expect(mocks.cleanup).toHaveBeenCalledWith(expect.anything(), alice);
    const command = mocks.cognitoSend.mock.calls[0][0] as { input: { Username: string } };
    expect(command.input.Username).toBe('alice-username');
  });

  it('refuses an unauthenticated call without touching any data', async () => {
    await expect(handler(event(null))).rejects.toThrow('Unauthenticated');
    expect(mocks.cleanup).not.toHaveBeenCalled();
    expect(mocks.cognitoSend).not.toHaveBeenCalled();
  });
});

describe('deleteMyAccount — order', () => {
  it('deletes the Cognito user only after every data cleanup', async () => {
    await expect(handler(event(alice))).resolves.toEqual({ deletedRows: 3 });
    expect(mocks.calls).toEqual(['cleanup', 'cognito']);
  });

  it('does not delete the Cognito user if a data cleanup fails', async () => {
    mocks.cleanup.mockRejectedValue(new Error('delete note: boom'));

    await expect(handler(event(alice))).rejects.toThrow('boom');
    expect(mocks.cognitoSend).not.toHaveBeenCalled();
  });

  it('treats an already-deleted Cognito user as done, so a re-run succeeds', async () => {
    mocks.cognitoSend.mockRejectedValue(new UserNotFoundException({ message: 'gone', $metadata: {} }));

    await expect(handler(event(alice))).resolves.toEqual({ deletedRows: 3 });
  });

  it('surfaces any other Cognito failure', async () => {
    mocks.cognitoSend.mockRejectedValue(new Error('throttled'));

    await expect(handler(event(alice))).rejects.toThrow('throttled');
  });
});

describe('routing', () => {
  it('rejects an unknown field', async () => {
    const e = { ...event(alice), info: { fieldName: 'somethingElse' } } as never;
    await expect(handler(e)).rejects.toThrow('Unknown field: somethingElse');
  });
});
