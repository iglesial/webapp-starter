// Validation for uploaded images. Returns a reason code rather than a
// sentence, like validateDisplayName: the module stays pure and
// language-agnostic, and the caller maps the reason to catalog copy.

// The formats every current browser can both decode and re-encode from.
// AVIF is deliberately absent: Safari's decode support is fine but canvas
// re-encoding is not, and we re-encode every upload.
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

// Generous, because it is a pre-resize bound: the file is downscaled straight
// after, so this only exists to reject something absurd before we decode it.
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export type ImageInvalid = { valid: false; reason: 'type' | 'too-large' | 'empty' };
export type ImageValid = { valid: true; file: File };
export type ImageValidation = ImageValid | ImageInvalid;

export function validateImageFile(file: File | null | undefined): ImageValidation {
  if (!file || file.size === 0) return { valid: false, reason: 'empty' };
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { valid: false, reason: 'type' };
  }
  if (file.size > MAX_UPLOAD_BYTES) return { valid: false, reason: 'too-large' };
  return { valid: true, file };
}
