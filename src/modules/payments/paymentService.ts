import { generateClient } from 'aws-amplify/data';
import type { PaymentsSchema } from '../../../amplify/modules/payments/schema';
import { PAYMENT_ERROR_CODES, type PaymentErrorCode } from './products';

// Typed against the module's own schema slice rather than the app Schema, so
// this compiles whether or not the module is switched on. At runtime the
// operations exist only when it is — check isPaymentsEnabled() (./enabled).
const client = generateClient<PaymentsSchema>();

export interface EntitlementRecord {
  productSlug: string;
  grantedAt: string;
}

export class PaymentError extends Error {
  readonly code: PaymentErrorCode;

  constructor(code: PaymentErrorCode, message: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
  }
}

// The Lambda throws the code as its message; AppSync wraps it, so match by
// inclusion. Anything unrecognised is PAY_UNKNOWN — never a raw server string.
function toPaymentError(errors: { message: string }[] | undefined | null): PaymentError {
  const message = errors?.[0]?.message ?? 'Unknown payment error';
  for (const code of Object.values(PAYMENT_ERROR_CODES)) {
    if (message.includes(code)) return new PaymentError(code, message);
  }
  return new PaymentError(PAYMENT_ERROR_CODES.unknown, message);
}

export const paymentService = {
  /** Returns the hosted Stripe Checkout URL; the caller redirects to it. */
  async createCheckoutSession(productSlug: string): Promise<string> {
    const { data, errors } = await client.mutations.createCheckoutSession(
      { productSlug },
      { authMode: 'userPool' },
    );
    if (errors?.length || !data) {
      console.error('createCheckoutSession failed', errors);
      throw toPaymentError(errors);
    }
    return data.url;
  },

  /** The signed-in user's own entitlements (owner auth). */
  async listMyEntitlements(userId: string): Promise<EntitlementRecord[]> {
    const collected: EntitlementRecord[] = [];
    let nextToken: string | null | undefined;
    do {
      const response = await client.models.Entitlement.listEntitlementByUserIdAndProductSlug(
        { userId },
        { authMode: 'userPool', nextToken },
      );
      if (response.errors?.length) {
        throw new Error(response.errors.map((e) => e.message).join(', '));
      }
      collected.push(
        ...response.data.map((row) => ({ productSlug: row.productSlug, grantedAt: row.grantedAt })),
      );
      nextToken = response.nextToken;
    } while (nextToken);
    return collected;
  },
};
