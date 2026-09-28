import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ create: vi.fn(), list: vi.fn(), getConfig: vi.fn() }));

vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({
    mutations: { createCheckoutSession: mocks.create },
    models: { Entitlement: { listEntitlementByUserIdAndProductSlug: mocks.list } },
  }),
}));
vi.mock('aws-amplify', () => ({ Amplify: { getConfig: mocks.getConfig } }));

const { PaymentError, paymentService } = await import('./paymentService');
const { isPaymentsEnabled } = await import('./enabled');

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('isPaymentsEnabled', () => {
  // The backend is the switch; the frontend reads it from amplify_outputs.
  it('follows whether the deployed schema has the checkout mutation', () => {
    mocks.getConfig.mockReturnValue({
      API: { GraphQL: { modelIntrospection: { mutations: { createCheckoutSession: {} } } } },
    });
    expect(isPaymentsEnabled()).toBe(true);

    mocks.getConfig.mockReturnValue({ API: { GraphQL: { modelIntrospection: { mutations: {} } } } });
    expect(isPaymentsEnabled()).toBe(false);

    mocks.getConfig.mockReturnValue({});
    expect(isPaymentsEnabled()).toBe(false);
  });
});

describe('paymentService.createCheckoutSession', () => {
  it('sends only the product slug and returns the Stripe URL', async () => {
    mocks.create.mockResolvedValue({ data: { url: 'https://checkout.stripe.com/x' }, errors: undefined });

    await expect(paymentService.createCheckoutSession('pro')).resolves.toBe('https://checkout.stripe.com/x');
    expect(mocks.create).toHaveBeenCalledWith({ productSlug: 'pro' }, { authMode: 'userPool' });
  });

  it('turns a coded server error into a PaymentError with that code', async () => {
    mocks.create.mockResolvedValue({
      data: null,
      errors: [{ message: 'Lambda:Unhandled: PAY_ALREADY_ENTITLED' }],
    });

    const err = await paymentService.createCheckoutSession('pro').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PaymentError);
    expect(err).toMatchObject({ code: 'PAY_ALREADY_ENTITLED' });
  });

  it('never surfaces an unrecognised server message as a code', async () => {
    mocks.create.mockResolvedValue({ data: null, errors: [{ message: 'Task timed out' }] });

    await expect(paymentService.createCheckoutSession('pro')).rejects.toMatchObject({
      code: 'PAY_UNKNOWN',
    });
  });
});

describe('paymentService.listMyEntitlements', () => {
  it('pages through every entitlement', async () => {
    mocks.list
      .mockResolvedValueOnce({ data: [{ productSlug: 'pro', grantedAt: 't1' }], nextToken: 'n1' })
      .mockResolvedValueOnce({ data: [{ productSlug: 'team', grantedAt: 't2' }], nextToken: null });

    await expect(paymentService.listMyEntitlements('user-1')).resolves.toEqual([
      { productSlug: 'pro', grantedAt: 't1' },
      { productSlug: 'team', grantedAt: 't2' },
    ]);
    expect(mocks.list).toHaveBeenLastCalledWith(
      { userId: 'user-1' },
      { authMode: 'userPool', nextToken: 'n1' },
    );
  });
});
