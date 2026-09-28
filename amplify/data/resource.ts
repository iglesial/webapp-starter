import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { account } from '../functions/account/resource';

const schema = a
  .schema({
    HealthCheck: a
      .model({
        pingedAt: a.datetime().required(),
      })
      .authorization((allow) => [allow.authenticated()]),

    DeleteAccountResult: a.customType({
      deletedRows: a.integer().required(),
    }),

    // Self-service erasure (/profile). No arguments on purpose: the account is
    // resolved from the caller's token inside the Lambda, and an id supplied
    // here would let any signed-in user delete any other. What gets deleted is
    // decided by amplify/functions/account/deleteAccountData.ts.
    deleteMyAccount: a
      .mutation()
      .returns(a.ref('DeleteAccountResult'))
      .handler(a.handler.function(account))
      .authorization((allow) => [allow.authenticated()]),
  })
  // Grants the function full data access so it can delete every model's rows.
  // Schema level is the only placement for allow.resource in this version of
  // the data schema. The Cognito delete permission — what actually makes this
  // function sensitive — is granted to it alone in backend.ts.
  .authorization((allow) => [allow.resource(account)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
