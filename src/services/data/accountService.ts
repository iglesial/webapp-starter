import { dataClient } from './client';
import { ACCOUNT_ERROR_CODES, type AccountErrorCode } from '../../utils/accountErrors';

export class AccountError extends Error {
  readonly code: AccountErrorCode;

  constructor(code: AccountErrorCode, message: string) {
    super(message);
    this.name = 'AccountError';
    this.code = code;
  }
}

export const accountService = {
  // Deletes the signed-in user's account. The mutation takes no arguments:
  // the account is resolved from the token inside the Lambda, never from
  // anything the client could substitute.
  //
  // A single error code on purpose. Every failure means the same thing to the
  // user — the account itself still exists, since Cognito is deleted last —
  // and the same thing to do: try again.
  async deleteMyAccount(): Promise<void> {
    const { data, errors } = await dataClient.mutations.deleteMyAccount({ authMode: 'userPool' });
    if (errors?.length || !data) {
      console.error('deleteMyAccount failed', errors);
      throw new AccountError(
        ACCOUNT_ERROR_CODES.deleteFailed,
        errors?.[0]?.message ?? 'Account deletion failed',
      );
    }
  },
};
