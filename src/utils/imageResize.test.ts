import { describe, expect, it } from 'vitest';
import { scaledDimensions, IMAGE_MAX_WIDTH } from './imageResize';

// The canvas plumbing around this cannot run in jsdom, so this arithmetic is
// the part that has to be pinned: a wrong ratio here stretches every image
// on the page, and a zero rounds down into a canvas that throws.
describe('scaledDimensions', () => {
  it('preserves the aspect ratio when downscaling', () => {
    expect(scaledDimensions(1600, 900, 800)).toEqual({ width: 800, height: 450 });
    expect(scaledDimensions(4000, 3000, 800)).toEqual({ width: 800, height: 600 });
  });

  // Upscaling a small source produces a blurry image that is also LARGER on
  // disk than the original — strictly worse on both axes.
  it('never upscales', () => {
    expect(scaledDimensions(320, 180, 800)).toEqual({ width: 320, height: 180 });
    expect(scaledDimensions(800, 450, 800)).toEqual({ width: 800, height: 450 });
  });

  it('handles portrait and square sources', () => {
    expect(scaledDimensions(1000, 2000, 800)).toEqual({ width: 800, height: 1600 });
    expect(scaledDimensions(1200, 1200, 800)).toEqual({ width: 800, height: 800 });
  });

  it('returns whole pixels', () => {
    const { width, height } = scaledDimensions(1023, 767, 800);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });

  // A 4000x3 banner scales to a height of 0.6px; rounding that to 0 makes
  // canvas.toBlob throw rather than produce an image.
  it('never rounds the height down to zero', () => {
    expect(scaledDimensions(4000, 3, 800).height).toBe(1);
  });

  it('treats degenerate dimensions as empty rather than throwing', () => {
    expect(scaledDimensions(0, 0)).toEqual({ width: 0, height: 0 });
    expect(scaledDimensions(-10, 100)).toEqual({ width: 0, height: 0 });
  });

  it('defaults to the standard content-image width', () => {
    expect(scaledDimensions(2000, 1000).width).toBe(IMAGE_MAX_WIDTH);
  });
});
