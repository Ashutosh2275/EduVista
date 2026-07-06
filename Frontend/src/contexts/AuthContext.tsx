import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  setAccessTokenGetter,
  setOnUnauthorized,
  setTokenRefreshHandler,
} from '../api/client';
import { authService } from '../services/authService';
import { setAdminTokenGetter } from '../services/adminService';
import { logAuthDebug, logAuthError } from '../utils/authErrors';
import type { AuthContextValue, AuthUser, LoginCredentials, RegisterData } from '../types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    void authService.logout().finally(() => {
      setUser(null);
      setToken(null);
      logAuthDebug('auth state cleared after logout');
    });
  }, []);

  useEffect(() => {
    setAccessTokenGetter(() => token ?? authService.restoreSession()?.token ?? null);
    setAdminTokenGetter(() => token ?? authService.restoreSession()?.token ?? null);
    setTokenRefreshHandler(() => authService.refreshToken());
    setOnUnauthorized(() => logout());
  }, [token, logout]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const session = authService.restoreSession();
        if (!session) {
          logAuthDebug('no stored session');
          return;
        }

        setUser(session.user);
        setToken(session.token);
        setAccessTokenGetter(() => session.token);
        setAdminTokenGetter(() => session.token);
        logAuthDebug('restored session', { userId: session.user.id });

        const freshUser = await authService.getCurrentUser();
        if (cancelled) return;

        if (freshUser) {
          setUser(freshUser);
          return;
        }

        const refreshed = await authService.refreshToken();
        if (cancelled) return;

        if (refreshed) {
          setToken(refreshed);
          setAccessTokenGetter(() => refreshed);
          setAdminTokenGetter(() => refreshed);
          const userAfterRefresh = await authService.getCurrentUser();
          if (cancelled) return;
          if (userAfterRefresh) {
            setUser(userAfterRefresh);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        logAuthError('auth bootstrap failed', error);
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    setToken(session.token);
    setAccessTokenGetter(() => session.token);
    setAdminTokenGetter(() => session.token);
    return session.user;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await authService.register(data);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
