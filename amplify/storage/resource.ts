import { defineStorage } from '@aws-amplify/backend';

// One bucket, split by prefix into audiences. Access is decided by the PREFIX,
// so a file's audience is chosen by where it is uploaded — see STORAGE_PREFIX
// in src/services/uploadService.ts, which must stay in step with this file.
export const storage = defineStorage({
  name: 'appMedia',
  access: (allow) => ({
    // Readable by ANYONE who knows the key, signed in or not (guests hold
    // Cognito unauthenticated-identity credentials). Right for public
    // marketing images and nothing else — never widen it to carry anything
    // private, and never upload user content here.
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],

    // Signed-in users only. For content that is free to members but not to
    // the world. No guest rule here is the whole point of the prefix.
    'members/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],

    // No per-user prefix yet, deliberately. `private/{entity_id}/*` with
    // allow.entity('identity') is the Amplify pattern for user uploads, but
    // account deletion (amplify/functions/account) would then also have to
    // delete that user's objects — grant it s3:DeleteObject on the prefix and
    // add a cleanup step — or deleted accounts leave their files behind.
  }),
});
