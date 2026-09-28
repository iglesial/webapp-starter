import { describe, expect, it, vi } from 'vitest';

vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  UserNotFoundException: class extends Error {},
  AdminDeleteUserCommand: class {},
  CognitoIdentityProviderClient: class {
    send = vi.fn();
  },
}));

const { ACCOUNT_CLEANUPS, deleteAccountData } = await import('./deleteAccountData');

const client = {} as never;
const identity = { sub: 's1', username: 'u1' };

describe('deleteAccountData', () => {
  it('ships with no cleanups: the template has no per-user models yet', () => {
    // When this fails, a per-user model was added. Good — now make sure the
    // entry deletes everything that model holds for the account.
    expect(ACCOUNT_CLEANUPS).toEqual([]);
  });

  it('runs every cleanup in order and reports what each removed', async () => {
    const order: string[] = [];
    const cleanups = [
      { name: 'Child', run: vi.fn(async () => (order.push('Child'), 2)) },
      { name: 'Parent', run: vi.fn(async () => (order.push('Parent'), 1)) },
    ];

    await expect(deleteAccountData(client, identity, cleanups)).resolves.toEqual({
      Child: 2,
      Parent: 1,
    });
    expect(order).toEqual(['Child', 'Parent']);
    expect(cleanups[0].run).toHaveBeenCalledWith(client, identity);
  });

  it('stops at the first failure rather than carrying on half-done', async () => {
    const later = vi.fn(async () => 1);
    const cleanups = [
      { name: 'Child', run: vi.fn(async () => Promise.reject(new Error('denied'))) },
      { name: 'Parent', run: later },
    ];

    await expect(deleteAccountData(client, identity, cleanups)).rejects.toThrow('denied');
    expect(later).not.toHaveBeenCalled();
  });
});
