// AppSync's AWSJSON scalar carries a JSON **string**, not an object.
//
// Passing an object as the GraphQL variable is rejected outright — "Variable
// 'x' has an invalid value" — and reading one back hands you a string, which
// a naive `typeof raw === 'object'` check silently treats as absent.
//
// Every a.json() model field and AWSJSON argument goes through these two
// helpers, so no call site has to remember the quirk.

/**
 * Serialises a value for an AWSJSON field.
 *
 * Always a string, never null: one of these fields is `.required()`, and a
 * helper that sometimes returns null would push that decision out to every
 * call site. A caller that genuinely wants the field empty writes `null`
 * itself, which reads as the deliberate choice it is.
 */
export function toAwsJson(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Reads an AWSJSON field back into a plain object.
 *
 * Accepts the string AppSync returns AND a plain object, because a value
 * written before this fix — or by a future client that serialises for us —
 * must not silently read as empty. Never throws: these usually run while a
 * page renders, where a malformed blob must cost one field, not the page.
 */
export function fromAwsJson(raw: unknown): Record<string, unknown> {
  const value = typeof raw === 'string' ? tryParse(raw) : raw;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function tryParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
