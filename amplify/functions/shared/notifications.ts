// Operator notifications: the short lines posted to Discord when something
// happens. Pure, so the one rule that governs them is testable.
//
// THE RULE: no personal data, ever. Not an email, not a display name, not a
// Cognito sub. Discord is a US chat service; the moment a message identifies
// someone it becomes a recipient of personal data — a processor to declare,
// a transfer to disclose in the privacy policy — for a convenience your admin
// pages can provide instead. If you find yourself wanting to pass a user in
// here, that is a privacy decision being reopened, not a small edit.

// One value per event type. Each gets an optional DISCORD_WEBHOOK_URL_<KIND>
// variable, so it can move to its own channel without a code change. Add the
// matching variable to the loop in backend.ts when you add a kind.
export type NotificationKind = 'SIGNUP';

export function signupMessage(): string {
  return '🎉 **New signup**';
}
