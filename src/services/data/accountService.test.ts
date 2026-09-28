import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataClient } from './client';
import { AccountError, accountService } from './accountService';

vi.mock('./client', () => ({
  dataClient: { mutations: { deleteMyAccount: vi.fn() } },
}));

const deleteMock = vi.mocked(dataClient.mutations.deleteMyAccount);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('accountService.deleteMyAccount', () => {
  // No identity is ever sent: the Lambda reads it from the token.
  it('calls the mutation with no arguments', async () => {
    deleteMock.mockResolvedValue({ data: { deletedRows: 0 }, errors: undefined } as never);

    await expect(accountService.deleteMyAccount()).resolves.toBeUndefined();
    expect(deleteMock).toHaveBeenCalledWith({ authMode: 'userPool' });
  });

  it('throws a coded error rather than a raw server message', async () => {
    deleteMock.mockResolvedValue({ data: null, errors: [{ message: 'delete note: boom' }] } as never);

    await expect(accountService.deleteMyAccount()).rejects.toMatchObject({
      code: 'ACCOUNT_DELETE_FAILED',
    });
    await expect(accountService.deleteMyAccount()).rejects.toBeInstanceOf(AccountError);
  });
});
