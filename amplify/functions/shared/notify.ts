import type { NotificationKind } from './notifications';

// Posts an operator notification to Discord.
//
// Two properties matter more than the feature itself:
//
// 1. It NEVER throws. These calls sit inside flows that matter (sign-up,
//    payment). A Discord outage must not cost someone their account or their
//    purchase — a notification is worth nothing beside either.
// 2. It never logs the webhook URL. That URL is a credential: anyone holding
//    it can post into the channel.
//
// What goes in the message is decided in ./notifications.ts, which keeps
// personal data out of it.

const TIMEOUT_MS = 3_000;

// A Discord webhook is bound to ONE channel, so one URL means one feed. The
// per-kind variable is the seam for splitting later: set only
// DISCORD_WEBHOOK_URL and everything lands together; add
// DISCORD_WEBHOOK_URL_<KIND> to move that event to its own channel.
function webhookUrlFor(kind: NotificationKind): string {
  return process.env[`DISCORD_WEBHOOK_URL_${kind}`] || process.env.DISCORD_WEBHOOK_URL || '';
}

export async function notifyDiscord(message: string, kind: NotificationKind): Promise<void> {
  const url = webhookUrlFor(kind);
  // Unset is not an error: sandboxes, CI and tests stay silent by default,
  // which is also why this is a branch variable rather than a secret() — an
  // absent value degrades to silence instead of failing the deploy.
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      // Status and kind only — never the URL, and never the response body,
      // which echoes the request back.
      console.warn(`Discord notification failed: ${kind} returned ${response.status}`);
    }
  } catch (err) {
    // Timeout, DNS, offline. Swallowed on purpose; see the header.
    console.warn(
      `Discord notification failed: ${kind} — ${err instanceof Error ? err.name : 'unknown error'}`,
    );
  }
}
