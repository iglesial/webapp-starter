import { remove, uploadData } from 'aws-amplify/storage';
import { resizeImageToFit, IMAGE_MAX_WIDTH } from '../utils/imageResize';

// Storage prefixes and who can read them. Must match amplify/storage/resource.ts,
// which is where access is actually enforced.
export const STORAGE_PREFIX = {
  /** Anyone, signed in or not. Admin-written. */
  public: 'public/',
  /** Signed-in users only. Admin-written. */
  members: 'members/',
} as const;

export type StoragePrefix = (typeof STORAGE_PREFIX)[keyof typeof STORAGE_PREFIX];

/**
 * Storage path for an uploaded image.
 *
 * Timestamped rather than a stable `<name>.webp`: replacing a file under a
 * fixed key would leave already-signed URLs pointing at the new object (or a
 * half-written one), and cached URLs would silently show the stale image. A
 * fresh key per upload makes replacement atomic from the reader's side.
 */
export function imagePath(prefix: StoragePrefix, name: string, timestamp: number): string {
  // Keys end up in URLs and logs: keep them to a safe, predictable shape.
  const safe = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
  return `${prefix}${safe}-${timestamp}.webp`;
}

export interface UploadedImage {
  path: string;
  width: number;
  height: number;
}

export const uploadService = {
  /**
   * Downscales to WebP, uploads, and returns the stored key with its encoded
   * dimensions (store them to reserve layout space). Validate the file with
   * validateImageFile first.
   */
  async uploadImage(
    prefix: StoragePrefix,
    name: string,
    file: File,
    maxWidth = IMAGE_MAX_WIDTH,
  ): Promise<UploadedImage> {
    const { blob, width, height } = await resizeImageToFit(file, maxWidth);
    const path = imagePath(prefix, name, Date.now());
    await uploadData({ path, data: blob, options: { contentType: blob.type } }).result;
    return { path, width, height };
  },

  /**
   * Best-effort cleanup of a replaced object.
   *
   * Never throws: the new file is already saved by the time this runs, and
   * failing the whole operation over an orphaned file would be worse than the
   * orphan. Only call it for a key nothing else references.
   */
  async removeQuietly(path: string): Promise<void> {
    try {
      await remove({ path });
    } catch (err) {
      console.error('Replaced file could not be removed:', err);
    }
  },
};
