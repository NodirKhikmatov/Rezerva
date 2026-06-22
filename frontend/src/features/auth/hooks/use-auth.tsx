'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AUTH_STORAGE_KEY } from '../constants/auth-storage.constants';
import type { AuthSession, AuthUser } from '../types/auth.types';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionState(readStoredSession());
    setIsLoading(false);
  }, []);

  const setSession = useCallback((nextSession: AuthSession) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSessionState(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      setSession,
      clearSession,
    }),
    [session, isLoading, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
