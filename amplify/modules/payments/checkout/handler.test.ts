import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSyncResolverEvent } from 'aws-lambda';

// createCheckoutSession is allow.authenticated() and callable directly, so the
// checks below are the real gate — the UI's are convenience only.

const mocks = vi.hoisted(() => ({
  sessionsCreate: vi.fn(),
  pricesList: vi.fn(),
  listEntitlements: vi.fn(),
}));

vi.mock('../client', () => ({
  client: {
    models: {
      Entitlement: { listEntitlementByUserIdAndProductSlug: mocks.listEntitlements },
    },
  },
}));

vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create: mocks.sessionsCreate } };
    prices = { list: mocks.pricesList };
  },
}));

const { handler } = await import('./handler');

function event(args: Record<string, unknown>, identity: unknown = { sub: 'user-1', username: 'u1' }) {
  return {
    arguments: args,
    identity,
    info: { fieldName: 'createCheckoutSession' },
  } as unknown as AppSyncResolverEvent<{ productSlug: string }>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listEntitlements.mockResolvedValue({ data: [], errors: undefined });
  mocks.pricesList.mockResolvedValue({ data: [{ id: 'price_pro' }] });
  mocks.sessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_1' });
});

describe('createCheckoutSession', () => {
  it('creates a session for the caller, priced by Stripe from the slug', async () => {
    await expect(handler(event({ productSlug: 'pro' }))).resolves.toEqual({
      url: 'https://checkout.stripe.com/c/pay/cs_1',
    });

    expect(mocks.pricesList).toHaveBeenCalledWith(
      expect.objectContaining({ lookup_keys: ['pro'], active: true }),
    );
    const params = mocks.sessionsCreate.mock.calls[0][0];
    expect(params.line_items).toEqual([{ price: 'price_pro', quantity: 1 }]);
    // Who bought what travels in the session; the webhook grants from it.
    expect(params.metadata).toEqual({ userId: 'user-1', productSlug: 'pro' });
    expect(params.client_reference_id).toBe('user-1');
    expect(params.success_url).toContain('/checkout/success?product=pro&session_id={CHECKOUT_SESSION_ID}');
  });

  // The buyer comes from the token, whatever the arguments say.
  it('ignores any user id smuggled into the arguments', async () => {
    await handler(event({ productSlug: 'pro', userId: 'someone-else' }));
    expect(mocks.sessionsCreate.mock.calls[0][0].metadata.userId).toBe('user-1');
  });

  it('refuses an unauthenticated call before touching Stripe', async () => {
    await expect(handler(event({ productSlug: 'pro' }, null))).rejects.toThrow('Unauthenticated');
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  // Nothing may be sold that the app does not know how to grant, even if
  // Stripe happens to have a price under that lookup key.
  it('refuses a product that is not in the catalog', async () => {
    await expect(handler(event({ productSlug: 'enterprise' }))).rejects.toThrow('PAY_NOT_FOUND');
    expect(mocks.pricesList).not.toHaveBeenCalled();
  });

  it('refuses to sell what the caller already owns', async () => {
    mocks.listEntitlements.mockResolvedValue({ data: [{ id: 'e1' }], errors: undefined });

    await expect(handler(event({ productSlug: 'pro' }))).rejects.toThrow('PAY_ALREADY_ENTITLED');
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it('reports a product with no Stripe price as not configured', async () => {
    mocks.pricesList.mockResolvedValue({ data: [] });

    await expect(handler(event({ productSlug: 'pro' }))).rejects.toThrow('PAY_NOT_CONFIGURED');
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });
});
