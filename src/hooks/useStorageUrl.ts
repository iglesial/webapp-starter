import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';

// Storage objects are served by short-lived signed URLs, so the same key would
// be re-signed by every component that shows it, on every mount and every
// language toggle. This module-level cache makes it one signature per key per
// session, shared by every consumer.
//
// It also keeps the URL stable between renders, so the browser reuses the
// image it already downloaded instead of refetching an identically-shaped but
// differently-signed URL.
const cache = new Map<string, { url: string; expiresAt: number }>();

// Signing is async, so a resolved-value cache alone does not dedupe consumers
// that mount in the same tick — they all miss and all sign. Sharing the
// in-flight promise is what makes it one request.
const inFlight = new Map<string, Promise<string | null>>();

// Re-sign a little before expiry rather than at it: a URL that expires while
// the image is still loading renders as a broken card.
const EXPIRY_MARGIN_MS = 60_000;

// An hour: long enough that a page left open does not break its images, short
// enough that a URL copied out of a private area stops working the same day.
// Access is enforced when the URL is SIGNED (storage/resource.ts), so a
// signed-in-only object is never signed for a guest in the first place.
const EXPIRES_IN_SECONDS = 3600;

function cached(key: string): string | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt - EXPIRY_MARGIN_MS <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.url;
}

function sign(key: string): Promise<string | null> {
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = getUrl({ path: key, options: { expiresIn: EXPIRES_IN_SECONDS } })
    .then((result) => {
      const url = result.url.toString();
      cache.set(key, {
        url,
        // The SDK reports the real expiry; fall back to our own window if it
        // ever stops doing so.
        expiresAt: result.expiresAt?.getTime() ?? Date.now() + EXPIRES_IN_SECONDS * 1000,
      });
      return url;
    })
    .catch((err: unknown) => {
      console.error('Storage URL could not be signed:', err);
      return null;
    })
    .finally(() => {
      // Not cached as a failure: a transient credential problem should not
      // blank an image for the rest of the session.
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

/**
 * Resolves a storage key to a signed URL.
 *
 * Returns null while resolving, when there is no key, and when signing fails
 * — a missing or unreadable image must never break the surface rendering it,
 * so callers fall back to a placeholder rather than an error state.
 */
export function useStorageUrl(key: string | null | undefined): string | null {
  // Keyed so a signature is never shown for the wrong object: without the key,
  // changing `key` would briefly render the previous image.
  const [signed, setSigned] = useState<{ key: string; url: string } | null>(null);

  // Derived during render, not in an effect: "no key" and "already cached"
  // are both known synchronously, and going through state would render one
  // empty frame first — a visible flash of the placeholder on every mount.
  const ready = key ? cached(key) : null;

  useEffect(() => {
    // Nothing to do for the two synchronous cases handled above.
    if (!key || cached(key)) return;

    let cancelled = false;
    void sign(key).then((url) => {
      if (!cancelled && url) setSigned({ key, url });
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) return null;
  return ready ?? (signed?.key === key ? signed.url : null);
}

// Test seam. Uploads use fresh keys (see uploadService), so a replaced image
// never needs its cached URL evicted.
export function clearStorageUrlCache(): void {
  cache.clear();
  inFlight.clear();
}
