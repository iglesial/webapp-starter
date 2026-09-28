import { describe, expect, it } from 'vitest';
import { purchaseMessage, signupMessage } from './notifications';

// Discord is a third party: these messages must never identify anyone.
describe('operator notifications', () => {
  it('announces a signup without saying who', () => {
    expect(signupMessage()).not.toMatch(/@|[0-9a-f]{8}-[0-9a-f]{4}/i);
  });

  it('names the product bought, and nothing else', () => {
    expect(purchaseMessage('pro')).toContain('pro');
  });

  // A slug that is not slug-shaped (a sub, an email, Discord markup or a
  // mention) is dropped rather than relayed.
  it.each(['0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'a@b.co', '@everyone', '**x**'])(
    'refuses to relay %s',
    (value) => {
      expect(purchaseMessage(value)).toContain('unknown');
      expect(purchaseMessage(value)).not.toContain(value);
    },
  );
});
