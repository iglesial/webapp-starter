import { act, render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hub } from 'aws-amplify/utils';
import { AuthContext } from './AuthContext';
import { AuthProvider } from './AuthProvider';
import * as authService from '../services/authService';
import type { AuthUser } from '../types/auth';

vi.mock('aws-amplify/utils', () => ({
  Hub: { listen: vi.fn() },
}));

vi.mock('../services/authService', () => ({
  fetchCurrentUser: vi.fn(),
  signOutCurrentUser: vi.fn(),
}));

type HubPayload = { payload: { event: string } };

function Probe() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div data-testid="no-provider">no-provider</div>;
  return (
    <div>
      <div data-testid="status">{ctx.status}</div>
      <div data-testid="email">{ctx.user?.email ?? 'none'}</div>
      <div data-testid="name">{ctx.user?.displayName ?? 'none'}</div>
      <div data-testid="is-admin">{String(ctx.isAdmin)}</div>
      <button onClick={() => void ctx.signOut()}>sign-out</button>
      <button onClick={() => void ctx.refreshUser()}>refresh</button>
    </div>
  );
}

const aliceUser: AuthUser = {
  sub: 'sub-1',
  email: 'alice@b.co',
  displayName: 'Alice',
  emailVerified: true,
  groups: [],
};

const aliceRenamed: AuthUser = { ...aliceUser, displayName: 'Alice-2' };
const aliceAdmin: AuthUser = { ...aliceUser, groups: ['admin'] };

describe('AuthProvider / AuthContext', () => {
  let hubCallback: ((data: HubPayload) => void) | undefined;
  let hubUnsubscribeSpy: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    hubUnsubscribeSpy = vi.fn<() => void>();
    hubCallback = undefined;
    const hubListenMock = Hub.listen as unknown as {
      mockImplementation: (
        impl: (channel: string, cb: (data: HubPayload) => void) => () => void,
      ) => void;
    };
    hubListenMock.mockImplementation((_channel, cb) => {
      hubCallback = cb;
      return () => hubUnsubscribeSpy();
    });
  });

  it('starts in loading and transitions to authenticated when user is present', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('email')).toHaveTextContent('alice@b.co');
  });

  it('transitions to unauthenticated when no user', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(null);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'),
    );
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('reloads user on Hub signedIn event', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValueOnce(null);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'),
    );
    vi.mocked(authService.fetchCurrentUser).mockResolvedValueOnce(aliceUser);
    await act(async () => {
      hubCallback?.({ payload: { event: 'signedIn' } });
    });
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('email')).toHaveTextContent('alice@b.co');
  });

  it('clears user on Hub signedOut event (cross-tab propagation)', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    await act(async () => {
      hubCallback?.({ payload: { event: 'signedOut' } });
    });
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('clears user on Hub tokenRefresh_failure event', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    await act(async () => {
      hubCallback?.({ payload: { event: 'tokenRefresh_failure' } });
    });
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
  });

  it('explicit signOut() clears user and transitions to unauthenticated', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceUser);
    vi.mocked(authService.signOutCurrentUser).mockResolvedValue({ ok: true, value: undefined });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    await act(async () => {
      screen.getByText('sign-out').click();
    });
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'),
    );
  });

  it('refreshUser() updates the user attribute in place without changing status', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValueOnce(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Alice'));
    vi.mocked(authService.fetchCurrentUser).mockResolvedValueOnce(aliceRenamed);
    await act(async () => {
      screen.getByText('refresh').click();
    });
    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Alice-2'));
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
  });

  it('invariant: status=authenticated implies user is non-null', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('email')).not.toHaveTextContent('none');
  });

  it('isAdmin is false when the user has no admin group', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('isAdmin is true when the user has the admin group', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(aliceAdmin);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
  });

  it('isAdmin flips to true on a tokenRefresh event that surfaces the admin group', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValueOnce(aliceUser);
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false'),
    );
    vi.mocked(authService.fetchCurrentUser).mockResolvedValueOnce(aliceAdmin);
    await act(async () => {
      hubCallback?.({ payload: { event: 'tokenRefresh' } });
    });
    await waitFor(() =>
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true'),
    );
  });

  it('unsubscribes from Hub on unmount', async () => {
    vi.mocked(authService.fetchCurrentUser).mockResolvedValue(null);
    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(Hub.listen).toHaveBeenCalled());
    unmount();
    expect(hubUnsubscribeSpy).toHaveBeenCalled();
  });
});
