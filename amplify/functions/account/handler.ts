import type { AppSyncResolverEvent } from 'aws-lambda';
import { fieldNameOf, identityOf } from '../shared/appsync';
import { client } from './client';
import type { Schema } from '../shared/dataClient';
import { deleteAccountData, deleteCognitoUser } from './deleteAccountData';

type DeleteResult = Schema['deleteMyAccount']['returnType'];

async function handleDeleteMyAccount(event: AppSyncResolverEvent<unknown>): Promise<DeleteResult> {
  // From the token, never from arguments: the mutation takes none on purpose.
  const identity = identityOf(event);

  const deleted = await deleteAccountData(client, {
    sub: identity.sub,
    username: identity.username,
  });

  await deleteCognitoUser(identity.username);

  // The sub is pseudonymous; no name or email is logged. This line is the
  // record that an erasure request was carried out.
  console.log(JSON.stringify({ event: 'account-deleted', sub: identity.sub, deleted }));

  return { deletedRows: Object.values(deleted).reduce((sum, n) => sum + n, 0) };
}

export const handler = async (event: AppSyncResolverEvent<unknown>): Promise<DeleteResult> => {
  const fieldName = fieldNameOf(event);
  switch (fieldName) {
    case 'deleteMyAccount':
      return handleDeleteMyAccount(event);
    default:
      throw new Error(`Unknown field: ${String(fieldName)}`);
  }
};
