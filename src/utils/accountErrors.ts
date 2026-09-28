// Coded errors for account operations. Services throw these codes; the UI maps
// them to catalog keys through ACCOUNT_ERROR_KEY in src/i18n/serviceErrors.ts,
// so a code added here without copy in every language is a compile error.
export const ACCOUNT_ERROR_CODES = {
  deleteFailed: 'ACCOUNT_DELETE_FAILED',
} as const;

export type AccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[keyof typeof ACCOUNT_ERROR_CODES];
