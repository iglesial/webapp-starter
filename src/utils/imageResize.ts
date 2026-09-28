// Client-side downscaling for uploaded images. A 5MB phone photo is entirely
// plausible, and every reader would then download it. Re-encoding here keeps
// stored assets small and uniform without a server-side image pipeline.

// Wide enough for a full-width content image at 1x and a ~400px card at 2x.
// Pass a smaller maxWidth for avatars and icons.
export const IMAGE_MAX_WIDTH = 800;

// WebP is smaller than JPEG at equal quality and is universally supported by
// the browsers this app targets. 0.85 is past the point where artefacts are
// visible on photographic content.
export const IMAGE_MIME = 'image/webp';
export const IMAGE_QUALITY = 0.85;

/**
 * Dimensions to draw at, preserving aspect ratio.
 *
 * Never upscales: a small source stays its own size rather than being blown up
 * into a blurry 800px asset that is also bigger on disk than the original.
 *
 * The pure, tested half of this module — the canvas plumbing below cannot run
 * in jsdom, but this is where the arithmetic bugs live.
 */
export function scaledDimensions(
  width: number,
  height: number,
  maxWidth = IMAGE_MAX_WIDTH,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  if (width <= maxWidth) return { width: Math.round(width), height: Math.round(height) };
  const scale = maxWidth / width;
  // At least 1px: a very wide, very short banner would otherwise round to a
  // zero-height canvas, which throws.
  return { width: maxWidth, height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Decodes, downscales and re-encodes an image to WebP.
 *
 * Deliberately thin: everything decidable is in scaledDimensions above, so
 * this layer is just browser API plumbing that unit tests cannot exercise.
 */
export async function resizeImage(
  file: File,
  maxWidth = IMAGE_MAX_WIDTH,
): Promise<Blob> {
  return (await resizeImageToFit(file, maxWidth)).blob;
}

export interface ResizedImage {
  blob: Blob;
  /** The encoded dimensions, so a caller can store them and reserve layout space. */
  width: number;
  height: number;
}

/**
 * As resizeImage, but reports the dimensions it encoded at.
 *
 * Store these alongside the key: an image whose size is known can reserve its
 * space in the page (width/height attributes) instead of shoving the text down
 * when it finally arrives. Reading them back off the blob later would mean decoding
 * the image a second time.
 */
export async function resizeImageToFit(
  file: File,
  maxWidth = IMAGE_MAX_WIDTH,
): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = scaledDimensions(bitmap.width, bitmap.height, maxWidth);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Image could not be encoded'));
        },
        IMAGE_MIME,
        IMAGE_QUALITY,
      );
    });
    return { blob, width, height };
  } finally {
    // Frees the decoded bitmap immediately rather than waiting for GC; these
    // are multi-megabyte buffers.
    bitmap.close();
  }
}
