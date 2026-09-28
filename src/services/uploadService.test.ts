import { beforeEach, describe, expect, it, vi } from 'vitest';
import { remove, uploadData } from 'aws-amplify/storage';
import { resizeImageToFit } from '../utils/imageResize';
import { imagePath, STORAGE_PREFIX, uploadService } from './uploadService';
import storageResource from '../../amplify/storage/resource.ts?raw';

vi.mock('aws-amplify/storage', () => ({ uploadData: vi.fn(), remove: vi.fn() }));
vi.mock('../utils/imageResize', () => ({ IMAGE_MAX_WIDTH: 800, resizeImageToFit: vi.fn() }));

const uploadMock = vi.mocked(uploadData);
const removeMock = vi.mocked(remove);
const resizeMock = vi.mocked(resizeImageToFit);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('imagePath', () => {
  it('builds a fresh, timestamped key under the prefix', () => {
    expect(imagePath(STORAGE_PREFIX.public, 'hero', 1700)).toBe('public/hero-1700.webp');
  });

  it('reduces the name to a safe slug', () => {
    expect(imagePath(STORAGE_PREFIX.members, ' My Photo (1).PNG ', 5)).toBe(
      'members/my-photo-1-png-5.webp',
    );
    expect(imagePath(STORAGE_PREFIX.public, '../../etc', 5)).toBe('public/etc-5.webp');
    expect(imagePath(STORAGE_PREFIX.public, '***', 5)).toBe('public/image-5.webp');
  });
});

// The client prefixes are just strings; the backend is what enforces access.
// If the two drift, uploads fail with an opaque "access denied".
describe('STORAGE_PREFIX', () => {
  it('matches a prefix granted in amplify/storage/resource.ts', () => {
    for (const prefix of Object.values(STORAGE_PREFIX)) {
      expect(storageResource).toContain(`'${prefix}*'`);
    }
  });
});

describe('uploadService.uploadImage', () => {
  it('resizes, uploads as WebP, and reports the key and dimensions', async () => {
    const blob = new Blob(['x'], { type: 'image/webp' });
    resizeMock.mockResolvedValue({ blob, width: 800, height: 450 });
    uploadMock.mockReturnValue({ result: Promise.resolve({}) } as never);

    const result = await uploadService.uploadImage(STORAGE_PREFIX.public, 'hero', new File([], 'a.png'), 400);

    expect(resizeMock).toHaveBeenCalledWith(expect.any(File), 400);
    expect(result).toMatchObject({ width: 800, height: 450 });
    expect(result.path).toMatch(/^public\/hero-\d+\.webp$/);
    expect(uploadMock).toHaveBeenCalledWith({
      path: result.path,
      data: blob,
      options: { contentType: 'image/webp' },
    });
  });
});

describe('uploadService.removeQuietly', () => {
  it('never throws, even when the delete fails', async () => {
    removeMock.mockRejectedValue(new Error('denied'));
    await expect(uploadService.removeQuietly('public/old.webp')).resolves.toBeUndefined();
  });
});
