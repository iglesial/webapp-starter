import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  HealthCheck: a
    .model({
      pingedAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
