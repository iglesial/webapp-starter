export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 30;

export type DisplayNameInvalid = {
  valid: false;
  reason: 'empty' | 'too-short' | 'too-long';
};
export type DisplayNameValid = { valid: true; value: string };
export type DisplayNameValidation = DisplayNameValid | DisplayNameInvalid;

export function isDisplayNameInvalid(r: DisplayNameValidation): r is DisplayNameInvalid {
  return r.valid === false;
}

export function validateDisplayName(raw: string): DisplayNameValidation {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { valid: false, reason: 'empty' };
  if (trimmed.length < DISPLAY_NAME_MIN) return { valid: false, reason: 'too-short' };
  if (trimmed.length > DISPLAY_NAME_MAX) return { valid: false, reason: 'too-long' };
  return { valid: true, value: trimmed };
}

// Interpolation values for the messages below, so callers don't repeat the
// limits: t(displayNameErrorKey(reason), DISPLAY_NAME_LIMITS).
export const DISPLAY_NAME_LIMITS = { min: DISPLAY_NAME_MIN, max: DISPLAY_NAME_MAX };

// Returns a translation key rather than a string: this module stays pure and
// language-agnostic, and the copy lives in the catalogs. The literal return
// type keeps the key checked against the catalogs at the call site.
export function displayNameErrorKey(
  reason: DisplayNameInvalid['reason'],
):
  | 'validation.displayName.required'
  | 'validation.displayName.tooShort'
  | 'validation.displayName.tooLong' {
  switch (reason) {
    case 'empty':
      return 'validation.displayName.required';
    case 'too-short':
      return 'validation.displayName.tooShort';
    case 'too-long':
      return 'validation.displayName.tooLong';
  }
}
