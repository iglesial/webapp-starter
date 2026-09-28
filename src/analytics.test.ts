import { beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '@plausible-analytics/tracker';
import { initAnalytics, isAnalyticsEnabled } from './analytics';

vi.mock('@plausible-analytics/tracker', () => ({ init: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('analytics', () => {
  // Sandboxes, previews and tests must never report page views.
  it('stays off without a domain', () => {
    expect(initAnalytics('')).toBe(false);
    expect(initAnalytics('   ')).toBe(false);
    expect(init).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled('')).toBe(false);
  });

  it('starts Plausible for the configured domain', () => {
    expect(initAnalytics(' example.com ')).toBe(true);
    expect(init).toHaveBeenCalledWith({ domain: 'example.com' });
  });
});
