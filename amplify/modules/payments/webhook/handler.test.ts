import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LambdaFunctionURLEvent } from 'aws-lambda';

// The webhook is a PUBLIC endpoint that creates Entitlements, so what it must
// never do is grant without a verified, paid, known session — or grant twice.

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  listBySession: vi.fn(),
  create: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('../client', () => ({
  client: {
    models: {
      Entitlement: {
        listEntitlementByStripeCheckoutSessionId: mocks.listBySession,
        create: mocks.create,
      },
    },
  },
}));

vi.mock('stripe', () => ({
  default: class {
    webhooks = { constructEvent: mocks.constructEvent };
  },
}));

vi.mock('../../../functions/shared/notify', () => ({ notifyDiscord: mocks.notify }));

const { handler } = await import('./handler');

function request(overrides: Partial<LambdaFunctionURLEvent> = {}): LambdaFunctionURLEvent {
  return {
    headers: { 'stripe-signature': 't=1,v1=abc' },
    body: '{"raw":"body"}',
    isBase64Encoded: false,
    ...overrides,
  } as LambdaFunctionURLEvent;
}

function completed(session: Record<string, unknown> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_1',
        payment_status: 'paid',
        metadata: { userId: 'user-1', productSlug: 'pro' },
        ...session,
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  mocks.constructEvent.mockReturnValue(completed());
  mocks.listBySession.mockResolvedValue({ data: [], errors: undefined });
  mocks.create.mockResolvedValue({ errors: undefined });
});

describe('stripe webhook — authenticity', () => {
  it('rejects a request whose signature does not verify, granting nothing', async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    await expect(handler(request())).resolves.toMatchObject({ statusCode: 400 });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects a request with no signature header', async () => {
    await expect(handler(request({ headers: {} }))).resolves.toMatchObject({ statusCode: 400 });
    expect(mocks.constructEvent).not.toHaveBeenCalled();
  });

  // The signature covers the raw bytes; verifying the base64 text would fail
  // every genuine delivery.
  it('verifies the decoded body when the Function URL base64-encodes it', async () => {
    const raw = '{"id":"evt_1"}';
    await handler(request({ body: Buffer.from(raw).toString('base64'), isBase64Encoded: true }));

    expect(mocks.constructEvent).toHaveBeenCalledWith(raw, 't=1,v1=abc', 'whsec_test');
  });
});

describe('stripe webhook — granting', () => {
  it('grants the entitlement named in the session, once, and announces it', async () => {
    await expect(handler(request())).resolves.toMatchObject({ statusCode: 200 });

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        productSlug: 'pro',
        stripeCheckoutSessionId: 'cs_1',
      }),
    );
    expect(mocks.notify).toHaveBeenCalledWith(expect.stringContaining('pro'), 'PURCHASE');
  });

  // Stripe delivers at least once.
  it('does not grant or announce a replayed session again', async () => {
    mocks.listBySession.mockResolvedValue({ data: [{ id: 'e1' }], errors: undefined });

    await expect(handler(request())).resolves.toMatchObject({ statusCode: 200 });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('never grants an unpaid session', async () => {
    mocks.constructEvent.mockReturnValue(completed({ payment_status: 'unpaid' }));

    await handler(request());
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('ignores other event types with a 200, so Stripe does not retry them', async () => {
    mocks.constructEvent.mockReturnValue({ type: 'charge.refunded', data: { object: {} } });

    await expect(handler(request())).resolves.toMatchObject({ statusCode: 200 });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('grants nothing for a product the catalog does not know', async () => {
    mocks.constructEvent.mockReturnValue(
      completed({ metadata: { userId: 'user-1', productSlug: 'enterprise' } }),
    );

    await expect(handler(request())).resolves.toMatchObject({ statusCode: 200 });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  // A failed write must NOT be swallowed as a 200: the retry Stripe makes on
  // a 5xx is what eventually grants a purchase that was paid for.
  it('fails loudly when the grant cannot be written, so Stripe retries', async () => {
    mocks.create.mockResolvedValue({ errors: [{ message: 'throttled' }] });

    await expect(handler(request())).rejects.toThrow('grant entitlement: throttled');
    expect(mocks.notify).not.toHaveBeenCalled();
  });
});
