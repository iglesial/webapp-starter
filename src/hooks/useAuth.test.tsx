import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextValue } from '../types/auth';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('throws a descriptive error when called outside <AuthProvider>', () => {
    expect(() => renderHook(() => useAuth())).toThrowError(
      /useAuth must be used inside <AuthProvider>/,
    );
  });

  it('returns the provided context value when wrapped in <AuthProvider>', () => {
    const value: AuthContextValue = {
      status: 'authenticated',
      user: {
        sub: 'sub-1',
        email: 'a@b.co',
        displayName: 'Alice',
        emailVerified: true,
        locale: null,
        groups: [],
      },
      isAdmin: false,
      signOut: async () => {},
      refreshUser: async () => {},
    };
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      ),
    });
    expect(result.current).toBe(value);
  });

  it('passes isAdmin=true through from context', () => {
    const value: AuthContextValue = {
      status: 'authenticated',
      user: {
        sub: 'sub-1',
        email: 'a@b.co',
        displayName: 'Alice',
        emailVerified: true,
        locale: null,
        groups: ['admin'],
      },
      isAdmin: true,
      signOut: async () => {},
      refreshUser: async () => {},
    };
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      ),
    });
    expect(result.current.isAdmin).toBe(true);
  });
});
