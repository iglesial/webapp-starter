import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_BYTES, validateImageFile } from './imageValidation';

function file(type: string, size: number, name = 'art'): File {
  const f = new File(['x'], name, { type });
  // File size is read-only, and constructing a 12MB blob in a unit test to
  // exercise a bound is wasteful.
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('validateImageFile', () => {
  it('accepts the formats the resizer can re-encode', () => {
    expect(validateImageFile(file('image/png', 1000)).valid).toBe(true);
    expect(validateImageFile(file('image/jpeg', 1000)).valid).toBe(true);
    expect(validateImageFile(file('image/webp', 1000)).valid).toBe(true);
  });

  // A PDF or an SVG would sail through createImageBitmap-or-not and fail
  // deep inside the upload; rejecting up front gives the user a usable
  // message instead.
  it('rejects formats that are not re-encodable images', () => {
    expect(validateImageFile(file('application/pdf', 1000))).toEqual({
      valid: false,
      reason: 'type',
    });
    expect(validateImageFile(file('image/svg+xml', 1000))).toEqual({
      valid: false,
      reason: 'type',
    });
  });

  it('rejects a file over the upload bound', () => {
    expect(validateImageFile(file('image/png', MAX_UPLOAD_BYTES + 1))).toEqual({
      valid: false,
      reason: 'too-large',
    });
    expect(validateImageFile(file('image/png', MAX_UPLOAD_BYTES)).valid).toBe(true);
  });

  it('rejects a missing or empty file', () => {
    expect(validateImageFile(null)).toEqual({ valid: false, reason: 'empty' });
    expect(validateImageFile(undefined)).toEqual({ valid: false, reason: 'empty' });
    expect(validateImageFile(file('image/png', 0))).toEqual({ valid: false, reason: 'empty' });
  });

  it('returns the file itself when valid, so callers need no cast', () => {
    const png = file('image/png', 1000, 'cover.png');
    const result = validateImageFile(png);
    expect(result.valid && result.file.name).toBe('cover.png');
  });
});
