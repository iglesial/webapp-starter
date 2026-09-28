import type { ParseKeys } from 'i18next';
import type { PaymentErrorCode, ProductSlug } from './products';

type MessageKey = ParseKeys<'translation'>;

// Display copy per product. Keyed by ProductSlug, so adding a product to
// PRODUCTS without copy here is a compile error.
export const PRODUCT_COPY: Record<ProductSlug, { name: MessageKey; description: MessageKey }> = {
  pro: { name: 'payments.products.pro.name', description: 'payments.products.pro.description' },
};

// Record<Code, MessageKey>: a new error code without copy fails to compile.
export const PAY_ERROR_KEY: Record<PaymentErrorCode, MessageKey> = {
  PAY_NOT_FOUND: 'payments.errors.PAY_NOT_FOUND',
  PAY_NOT_CONFIGURED: 'payments.errors.PAY_NOT_CONFIGURED',
  PAY_ALREADY_ENTITLED: 'payments.errors.PAY_ALREADY_ENTITLED',
  PAY_UNKNOWN: 'payments.errors.PAY_UNKNOWN',
};
