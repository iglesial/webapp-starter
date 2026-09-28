import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUrl } from 'aws-amplify/storage';
import { clearStorageUrlCache, useStorageUrl } from './useStorageUrl';

vi.mock('aws-amplify/storage', () => ({ getUrl: vi.fn() }));

const getUrlMock = vi.mocked(getUrl);

function Consumer({ storageKey }: { storageKey: string | null }) {
  const url = useStorageUrl(storageKey);
  return <span data-testid="url">{url ?? 'none'}</span>;
}

beforeEach(() => {
  vi.clearAllMocks();
  clearStorageUrlCache();
});

describe('useStorageUrl', () => {
  // The reason this hook exists: without the shared cache, every component
  // showing the same image signs its key separately, on every mount and every
  // language toggle.
  it('signs a key once no matter how many consumers render it', async () => {
    getUrlMock.mockResolvedValue({
      url: new URL('https://example.com/a.webp'),
      expiresAt: new Date(Date.now() + 3_600_000),
    } as never);

    render(
      <>
        <Consumer storageKey="public/a.webp" />
        <Consumer storageKey="public/a.webp" />
        <Consumer storageKey="public/a.webp" />
      </>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId('url')[0]).toHaveTextContent('https://example.com/a.webp'),
    );
    expect(getUrlMock).toHaveBeenCalledTimes(1);
  });

  // Serving an expired signature renders a broken image, so a stale entry
  // must not be reused.
  it('re-signs a key whose URL has expired', async () => {
    getUrlMock.mockResolvedValueOnce({
      url: new URL('https://example.com/stale.webp'),
      expiresAt: new Date(Date.now() - 1000),
    } as never);
    const { unmount } = render(<Consumer storageKey="public/a.webp" />);
    await waitFor(() => expect(getUrlMock).toHaveBeenCalledTimes(1));
    unmount();

    getUrlMock.mockResolvedValueOnce({
      url: new URL('https://example.com/fresh.webp'),
      expiresAt: new Date(Date.now() + 3_600_000),
    } as never);
    render(<Consumer storageKey="public/a.webp" />);

    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('fresh.webp'));
    expect(getUrlMock).toHaveBeenCalledTimes(2);
  });

  it('signs nothing when there is no key', () => {
    render(<Consumer storageKey={null} />);

    expect(screen.getByTestId('url')).toHaveTextContent('none');
    expect(getUrlMock).not.toHaveBeenCalled();
  });
});
