// Payments module (src/modules/payments). Delete this file and its entry in
// both index.ts files if you remove the module.
export const payments = {
  products: {
    pro: {
      name: 'Pro',
      description: 'Everything in the free plan, plus the Pro features. One-time purchase.',
    },
  },
  checkout: {
    title: 'Checkout',
    buy: 'Continue to payment',
    redirecting: 'Redirecting to Stripe…',
    secure: 'Payment is handled securely by Stripe. We never see your card details.',
    alreadyOwned: 'You already own this.',
    notFound: 'This product does not exist.',
  },
  success: {
    title: 'Thank you',
    activating: 'Payment received — activating your purchase…',
    done: 'Your purchase is active.',
    slow: 'Your payment went through, but activation is taking longer than usual. It will appear on its own shortly; if it does not within a few minutes, contact us.',
    continue: 'Continue',
  },
  errors: {
    PAY_NOT_FOUND: 'This product does not exist.',
    PAY_NOT_CONFIGURED: 'This product cannot be bought yet.',
    PAY_ALREADY_ENTITLED: 'You already own this.',
    PAY_UNKNOWN: "The payment couldn't be started. Please try again.",
  },
  // Rendered by the privacy policy and account deletion while payments are on.
  legal: {
    purpose: 'Payment',
    purposeData: 'What you bought and when, and the Stripe payment reference. We never see card details.',
    basis: 'Performance of the contract',
    retention: 'Proof of purchase',
    retentionValue: 'As long as the law requires (accounting and disputes), including after account deletion',
    processor: 'Payment processing',
    accountKept: 'Kept: proof of your purchases, as the law requires.',
  },
} as const;
