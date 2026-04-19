import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Hub } from 'aws-amplify/utils';
import { AuthContext } from './AuthContext';
import type { AuthContextValue, AuthStatus, AuthUser } from '../types/auth';
import { fetchCurrentUser, signOutCurrentUser } from '../services/authService';

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    const fresh = await fetchCurrentUser();
    if (!mountedRef.current) return;
    if (fresh) {
      setUser(fresh);
      setStatus('authenticated');
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await fetchCurrentUser();
    if (!mountedRef.current) return;
    if (fresh) setUser(fresh);
  }, []);

  const signOut = useCallback(async () => {
    await signOutCurrentUser();
    if (!mountedRef.current) return;
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Initial auth resolution — synchronous setState inside an effect is the
    // canonical pattern for initial data fetch and is accepted here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
        case 'tokenRefresh':
          void load();
          break;
        case 'signedOut':
        case 'tokenRefresh_failure':
          setUser(null);
          setStatus('unauthenticated');
          break;
        default:
          break;
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [load]);

  const isAdmin = user?.groups.includes('admin') ?? false;
  const value: AuthContextValue = { status, user, isAdmin, signOut, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
