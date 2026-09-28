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
export type NotificationKind = 'SIGNUP' | 'PURCHASE';

export function signupMessage(): string {
  return '🎉 **New signup**';
}

// The product slug only — never the buyer. Slugs come from the product catalog
// (src/modules/payments/products.ts), but they end up in a Discord message, so
// anything outside the catalog's own shape is dropped rather than relayed.
//
// Starting with a letter rejects most Cognito subs, but not all: a UUID can
// begin with a hex letter. So identifier SHAPES are rejected outright too.
const SLUG_PATTERN = /^[a-z][a-z0-9-]{0,39}$/;
const UUID_SHAPE = /^[0-9a-f-]{8,}$/; // hex-and-hyphens only: an id, never a slug

function safeSlug(slug: string): string {
  return SLUG_PATTERN.test(slug) && !UUID_SHAPE.test(slug) ? slug : 'unknown';
}

export function purchaseMessage(productSlug: string): string {
  return `💰 **Purchase** — ${safeSlug(productSlug)}`;
}
