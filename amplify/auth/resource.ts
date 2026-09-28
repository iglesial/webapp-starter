import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from '../functions/post-confirmation/resource';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    nickname: {
      required: true,
      mutable: true,
    },
  },
  groups: ['admin'],
  // Notifies Discord when an account is actually created. The trigger also
  // fires on password-reset confirmation, which the handler filters out.
  triggers: { postConfirmation },
});
