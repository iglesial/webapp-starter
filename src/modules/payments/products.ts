// The product catalog, shared by the checkout page and the checkout Lambda.
// Pure data with no imports, so the Lambda can bundle it.
//
// The PRICE CHARGED is whatever Stripe holds, never these numbers: the Lambda
// finds the Stripe price whose lookup key equals the slug. Create that price in
// Stripe (test and live mode separately) with lookup_key = slug. `priceCents`
// and `currency` are only what the checkout page DISPLAYS — keep them equal to
// the Stripe price, or the page announces one amount and Stripe charges another.
//
// A slug missing here is refused by the Lambda even if Stripe has a price for
// it, so nothing can be bought that the app does not know how to grant.

export interface Product {
  slug: string;
  priceCents: number;
  currency: string;
}

export const PRODUCTS = [
  // Example product. Rename it, then give it a name and description in
  // copy.ts (the compiler asks you to).
  { slug: 'pro', priceCents: 1900, currency: 'EUR' },
] as const satisfies readonly Product[];

export type ProductSlug = (typeof PRODUCTS)[number]['slug'];

export function findProduct(slug: string): (typeof PRODUCTS)[number] | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

// Thrown by the Lambdas as the error message, matched by paymentService, and
// mapped to catalog keys in ./copy.ts.
export const PAYMENT_ERROR_CODES = {
  notFound: 'PAY_NOT_FOUND',
  notConfigured: 'PAY_NOT_CONFIGURED',
  alreadyEntitled: 'PAY_ALREADY_ENTITLED',
  unknown: 'PAY_UNKNOWN',
} as const;

export type PaymentErrorCode = (typeof PAYMENT_ERROR_CODES)[keyof typeof PAYMENT_ERROR_CODES];
