import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { account } from './functions/account/resource.js';
import { postConfirmation } from './functions/post-confirmation/resource.js';
import { storage } from './storage/resource.js';

const backend = defineBackend({
  auth,
  data,
  account,
  // Also wired as the Cognito trigger in auth/resource.ts. Listed here as well
  // so it is addressable as backend.postConfirmation below — a trigger passed
  // only to defineAuth is deployed but not exposed, and addEnvironment on it
  // would have nowhere to go.
  postConfirmation,
  storage,
});

// Self-service account deletion removes the caller's Cognito user as its LAST
// step. Granted to the account function only, scoped to this user pool, and to
// nothing else: it is the one permission here that destroys accounts.
backend.account.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['cognito-idp:AdminDeleteUser'],
    resources: [backend.auth.resources.userPool.userPoolArn],
  }),
);
backend.account.addEnvironment('USER_POOL_ID', backend.auth.resources.userPool.userPoolId);

// Discord operator notifications. Branch environment variables (set in the
// Amplify console, read here at synth time) rather than secret(): an absent
// webhook must degrade to silence, not fail the deploy, and sandboxes stay
// quiet by default.
//
// One URL means one channel. DISCORD_WEBHOOK_URL sends every event to one
// feed; DISCORD_WEBHOOK_URL_<KIND> moves that event to its own channel with no
// code change. The URL is a credential: never log it; rotate it by deleting
// the webhook in Discord.
const discordEnv = {
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ?? '',
  DISCORD_WEBHOOK_URL_SIGNUP: process.env.DISCORD_WEBHOOK_URL_SIGNUP ?? '',
};
// Set on every notifying function, empty ones included: unset and empty both
// resolve to silence in notify.ts, and identical environments keep splitting a
// channel later a console change rather than a code change.
for (const [name, value] of Object.entries(discordEnv)) {
  backend.postConfirmation.addEnvironment(name, value);
}
