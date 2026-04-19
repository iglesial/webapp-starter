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

export function displayNameErrorMessage(reason: DisplayNameInvalid['reason']): string {
  switch (reason) {
    case 'empty':
      return 'Display name is required.';
    case 'too-short':
      return `Display name must be at least ${DISPLAY_NAME_MIN} characters.`;
    case 'too-long':
      return `Display name must be at most ${DISPLAY_NAME_MAX} characters.`;
  }
}
