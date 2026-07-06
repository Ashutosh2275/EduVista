import { apiClient } from '../api/client';
import type { AuthSession, AuthUser, LoginCredentials, RegisterData } from '../types/auth';
import { AuthError } from '../types/auth';
import { logAuthDebug, logAuthError, mapToAuthError } from '../utils/authErrors';

const SESSION_KEY = 'eduvista_auth_session';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser & {
    preferences?: unknown;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface RefreshResponse {
  accessToken: string;
}

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.replace(/\D/g, ''));
}

export function validatePasswordStrength(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const email = credentials.email.trim();
    const password = credentials.password;

    if (!email || !password) {
      throw new AuthError('REQUIRED_FIELDS', 'Email and password are required.');
    }
    if (!validateEmail(email)) {
      throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address.');
    }

    logAuthDebug('login attempt', { email });

    try {
      const data = await apiClient.post<LoginResponse>(
        '/auth/login',
        { email, password, rememberMe: credentials.rememberMe ?? false },
        { skipAuth: true, skipRefresh: true }
      );

      if (!data?.accessToken || !data?.user) {
        throw new AuthError('UNKNOWN_ERROR', 'Invalid login response from server.');
      }

      const session: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          phone: data.user.phone,
          avatar: data.user.avatar,
          field: data.user.field,
        },
        token: data.accessToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };

      writeSession(session);
      logAuthDebug('login success', { userId: session.user.id, role: session.user.role });
      return session;
    } catch (error) {
      logAuthError('login failed', error);
      throw mapToAuthError(error);
    }
  },

  async register(data: RegisterData): Promise<void> {
    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone.replace(/\D/g, '');

    if (!name || !email || !phone || !data.password) {
      throw new AuthError('REQUIRED_FIELDS', 'All required fields must be filled.');
    }
    if (!validateEmail(email)) {
      throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address.');
    }
    if (!validatePhone(phone)) {
      throw new AuthError('INVALID_PHONE', 'Please enter a valid 10-digit phone number.');
    }
    if (!validatePasswordStrength(data.password)) {
      throw new AuthError(
        'WEAK_PASSWORD',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
    }

    logAuthDebug('register attempt', { email });

    try {
      await apiClient.post<null>(
        '/auth/register',
        { name, email, phone, password: data.password, field: data.field },
        { skipAuth: true, skipRefresh: true }
      );
      logAuthDebug('register success', { email });
    } catch (error) {
      logAuthError('register failed', error);
      throw mapToAuthError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<null>('/auth/logout', {}, { skipRefresh: true });
    } catch (error) {
      logAuthError('logout API failed (clearing local session anyway)', error);
    } finally {
      clearSession();
      logAuthDebug('logout complete');
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const data = await apiClient.post<RefreshResponse>(
        '/auth/refresh-token',
        {},
        { skipAuth: true, skipRefresh: true }
      );

      if (!data?.accessToken) {
        clearSession();
        return null;
      }

      const session = readSession();
      if (session) {
        session.token = data.accessToken;
        session.expiresAt = Date.now() + 15 * 60 * 1000;
        writeSession(session);
      }

      logAuthDebug('token refreshed');
      return data.accessToken;
    } catch (error) {
      logAuthError('refresh token failed', error);
      clearSession();
      return null;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const data = await apiClient.get<MeResponse>('/auth/me');
      const session = readSession();
      if (session && data?.user) {
        session.user = { ...session.user, ...data.user };
        writeSession(session);
      }
      return data?.user ?? null;
    } catch (error) {
      logAuthError('getCurrentUser failed', error);
      return null;
    }
  },

  restoreSession(): AuthSession | null {
    return readSession();
  },

  getSession(): AuthSession | null {
    return readSession();
  },

  updateSessionToken(token: string): void {
    const session = readSession();
    if (session) {
      session.token = token;
      session.expiresAt = Date.now() + 15 * 60 * 1000;
      writeSession(session);
    }
  },

  rememberEmail(email: string | null): void {
    if (email) {
      localStorage.setItem('eduvista_remember_email', email);
    } else {
      localStorage.removeItem('eduvista_remember_email');
    }
  },

  getRememberedEmail(): string {
    return localStorage.getItem('eduvista_remember_email') ?? '';
  },

  async forgotPassword(email: string): Promise<void> {
    const trimmed = email.trim();
    if (!trimmed) {
      throw new AuthError('REQUIRED_FIELDS', 'Email is required.');
    }
    if (!validateEmail(trimmed)) {
      throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address.');
    }

    logAuthDebug('forgot-password attempt', { email: trimmed });

    try {
      await apiClient.post<null>(
        '/auth/forgot-password',
        { email: trimmed },
        { skipAuth: true, skipRefresh: true }
      );
      logAuthDebug('forgot-password success', { email: trimmed });
    } catch (error) {
      logAuthError('forgot-password failed', error);
      throw mapToAuthError(error);
    }
  },

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    if (!token.trim()) {
      throw new AuthError('INVALID_RESET_TOKEN', 'Reset token is missing. Please use the link from your email.');
    }
    if (!password || !confirmPassword) {
      throw new AuthError('REQUIRED_FIELDS', 'Password and confirmation are required.');
    }
    if (password !== confirmPassword) {
      throw new AuthError('PASSWORD_MISMATCH', 'Passwords do not match.');
    }
    if (!validatePasswordStrength(password)) {
      throw new AuthError(
        'WEAK_PASSWORD',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
    }

    logAuthDebug('reset-password attempt');

    try {
      await apiClient.post<null>(
        '/auth/reset-password',
        { token: token.trim(), password, confirmPassword },
        { skipAuth: true, skipRefresh: true }
      );
      logAuthDebug('reset-password success');
    } catch (error) {
      logAuthError('reset-password failed', error);
      throw mapToAuthError(error);
    }
  },
};
