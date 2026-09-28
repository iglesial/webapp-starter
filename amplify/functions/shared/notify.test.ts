import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyDiscord } from './notify';

// These calls sit inside sign-up (and whatever else you wire them into). Everything below
// exists to prove that a broken Discord costs a log line and nothing else.

const fetchMock = vi.fn();
const warn = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(warn);
  fetchMock.mockReset();
  warn.mockReset();
  delete process.env.DISCORD_WEBHOOK_URL;
  delete process.env.DISCORD_WEBHOOK_URL_SIGNUP;
  fetchMock.mockResolvedValue({ ok: true, status: 204 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('configuration', () => {
  // Sandboxes, CI and tests must stay silent without anyone opting out.
  it('does nothing when no webhook is configured', async () => {
    await notifyDiscord('hello', 'SIGNUP');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  // backend.ts sets every variable on every notifying function, filling the
  // unused ones with ''. Empty must be as silent as absent, or an environment
  // that only sets DISCORD_WEBHOOK_URL would POST to the empty string.
  it('treats an empty variable as unconfigured', async () => {
    process.env.DISCORD_WEBHOOK_URL = '';
    process.env.DISCORD_WEBHOOK_URL_SIGNUP = '';

    await notifyDiscord('hello', 'SIGNUP');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls back to the shared webhook when the per-kind one is empty', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/shared';
    process.env.DISCORD_WEBHOOK_URL_SIGNUP = '';

    await notifyDiscord('hello', 'SIGNUP');

    expect(fetchMock.mock.calls[0][0]).toBe('https://discord.test/shared');
  });

  it('posts the message to the shared webhook', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/shared';

    await notifyDiscord('hello', 'SIGNUP');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://discord.test/shared');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ content: 'hello' });
  });

  // The seam for splitting channels later without touching code.
  it('prefers a per-kind webhook over the shared one', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/shared';
    process.env.DISCORD_WEBHOOK_URL_SIGNUP = 'https://discord.test/signups';

    await notifyDiscord('signed up', 'SIGNUP');

    expect(fetchMock.mock.calls[0][0]).toBe('https://discord.test/signups');
  });

  it('uses a per-kind webhook even with no shared one', async () => {
    process.env.DISCORD_WEBHOOK_URL_SIGNUP = 'https://discord.test/signups';

    await notifyDiscord('hi', 'SIGNUP');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://discord.test/signups');
  });
});

describe('failure is never the caller’s problem', () => {
  beforeEach(() => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/shared';
  });

  it.each([
    ['Discord returns 500', () => fetchMock.mockResolvedValue({ ok: false, status: 500 })],
    ['the request times out', () => fetchMock.mockRejectedValue(new DOMException('x', 'TimeoutError'))],
    ['fetch itself rejects', () => fetchMock.mockRejectedValue(new Error('offline'))],
  ])('resolves when %s', async (_label, arrange) => {
    arrange();

    await expect(notifyDiscord('hello', 'SIGNUP')).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  // The URL is a credential: anyone holding it can post to the channel. It
  // must not end up in CloudWatch, and neither must the response body, which
  // echoes the request back.
  it('never writes the webhook URL to the log', async () => {
    fetchMock.mockRejectedValue(new Error('https://discord.test/shared refused'));

    await notifyDiscord('hello', 'SIGNUP');

    for (const call of warn.mock.calls) {
      expect(String(call[0])).not.toContain('discord.test/shared');
    }
  });

  it('gives up rather than hanging on a slow Discord', async () => {
    await notifyDiscord('hello', 'SIGNUP');

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
});
