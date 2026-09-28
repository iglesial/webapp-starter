import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';

const notifyDiscord = vi.hoisted(() => vi.fn());
vi.mock('../shared/notify', () => ({ notifyDiscord }));

const { handler } = await import('./handler');

function event(triggerSource: PostConfirmationTriggerEvent['triggerSource']) {
  return { triggerSource, request: { userAttributes: {} } } as PostConfirmationTriggerEvent;
}

function run(e: PostConfirmationTriggerEvent) {
  return handler(e, {} as never, () => {}) as unknown as Promise<PostConfirmationTriggerEvent>;
}

beforeEach(() => {
  vi.clearAllMocks();
  notifyDiscord.mockResolvedValue(undefined);
});

describe('post-confirmation trigger', () => {
  it('announces a genuine signup', async () => {
    await run(event('PostConfirmation_ConfirmSignUp'));

    expect(notifyDiscord).toHaveBeenCalledTimes(1);
    expect(notifyDiscord.mock.calls[0][1]).toBe('SIGNUP');
  });

  // The same trigger fires when someone confirms a password reset. Without the
  // guard every forgotten password looks like a new customer, and nothing
  // reveals the mistake until it happens.
  it('stays silent on a password reset', async () => {
    await run(event('PostConfirmation_ConfirmForgotPassword'));

    expect(notifyDiscord).not.toHaveBeenCalled();
  });

  it('sends no identifier, only the event', async () => {
    await run(event('PostConfirmation_ConfirmSignUp'));

    const message = notifyDiscord.mock.calls[0][0] as string;
    expect(message).not.toMatch(/@|[0-9a-f]{8}-[0-9a-f]{4}/i);
  });

  it('returns the event unchanged, as Cognito requires', async () => {
    const input = event('PostConfirmation_ConfirmSignUp');

    await expect(run(input)).resolves.toBe(input);
  });

  // This runs inside sign-up: a throw here would stop confirmation and leave
  // someone unable to finish creating their account.
  it('still completes confirmation when notifying fails', async () => {
    notifyDiscord.mockRejectedValue(new Error('discord is down'));
    const input = event('PostConfirmation_ConfirmSignUp');

    await expect(run(input)).resolves.toBe(input);
  });
});
