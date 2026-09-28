import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Client } from 'aws-amplify/data';
import type { Schema } from '../shared/dataClient';

// The one implementation of "delete this account". If you later add a second
// way to delete accounts (a scheduled purge of dormant ones, an admin action),
// call this rather than copying it: two copies eventually disagree.

export type DataClient = Client<Schema>;

export interface AccountIdentity {
  sub: string;
  username: string;
}

// One step of the cascade: deletes everything one model holds for this
// account and returns how many rows it removed.
export interface AccountCleanup {
  name: string;
  run: (client: DataClient, identity: AccountIdentity) => Promise<number>;
}

// EVERY model that stores per-user data needs an entry here, or deleting an
// account leaves that data behind — which your privacy policy almost
// certainly promises not to do. The template has no per-user models yet.
//
// Give each per-user model an explicit owner field holding the bare sub, and
// index it (the webapp-starter skill, recipe 3):
//
//   ownerId: a.string().authorization((allow) => [   // no 'update': owners can't
//     allow.ownerDefinedIn('ownerId').identityClaim('sub').to(['create', 'read', 'delete']),
//   ]),                                                // hand rows to others
//   .authorization((allow) => [allow.ownerDefinedIn('ownerId').identityClaim('sub')])
//   .secondaryIndexes((index) => [index('ownerId')])      // → listNoteByOwnerId
//
// then page through that index here (verified to typecheck and synth):
//
//   import { collectAll, throwOnErrors } from '../shared/appsync';
//
//   {
//     name: 'Note',
//     run: async (client, { sub }) => {
//       const rows = await collectAll(
//         (nextToken) => client.models.Note.listNoteByOwnerId({ ownerId: sub }, { nextToken }),
//         'note lookup',
//       );
//       for (const row of rows) {
//         const { errors } = await client.models.Note.delete({ id: row.id });
//         throwOnErrors(errors, 'delete note');
//       }
//       return rows.length;
//     },
//   },
//
// Order matters when rows reference each other: delete children before the
// row they point to, so a failure part-way leaves a parent with no children
// rather than orphans nothing can reach.
// Deliberately NOT listed: the payments module's Entitlement rows. They are
// proof of purchase (accounting, chargebacks), hold only the pseudonymous sub,
// and the deletion dialog says they are kept.
export const ACCOUNT_CLEANUPS: AccountCleanup[] = [];

// Runs every cleanup in order and reports what each removed. Stops at the
// first failure, and is safe to run again: each step deletes rows it has just
// listed, so a re-run picks up where the last one stopped.
export async function deleteAccountData(
  client: DataClient,
  identity: AccountIdentity,
  cleanups: readonly AccountCleanup[] = ACCOUNT_CLEANUPS,
): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {};
  for (const cleanup of cleanups) {
    deleted[cleanup.name] = await cleanup.run(client, identity);
  }
  return deleted;
}

const cognito = new CognitoIdentityProviderClient();

// Always LAST, and only once the data above is gone: deleting the user first
// would strand data nobody could then reach or delete. An already-deleted
// user counts as done, so a re-run finishes cleanly.
export async function deleteCognitoUser(username: string): Promise<void> {
  try {
    await cognito.send(
      new AdminDeleteUserCommand({ UserPoolId: process.env.USER_POOL_ID, Username: username }),
    );
  } catch (err) {
    if (!(err instanceof UserNotFoundException)) throw err;
  }
}
