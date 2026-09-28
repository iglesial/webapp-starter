import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { notifyDiscord } from '../shared/notify';
import { signupMessage } from '../shared/notifications';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  // This trigger fires for BOTH sign-up confirmation and password-reset
  // confirmation. Without this guard, every forgotten password would announce
  // itself as a new user — and the mistake is invisible until someone resets.
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    try {
      // No identifier is passed: the message says a signup happened, never
      // who. See ../shared/notifications.ts for why.
      await notifyDiscord(signupMessage(), 'SIGNUP');
    } catch {
      // notifyDiscord already swallows everything, so this should be
      // unreachable — and that is exactly why it is here. Confirmation must
      // not depend on another module continuing to keep that promise.
    }
  }

  // Cognito requires the event back, unchanged.
  return event;
};
