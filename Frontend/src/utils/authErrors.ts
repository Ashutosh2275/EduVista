import { ApiClientError } from '../api/types';
import { AuthError, type AuthErrorCode } from '../types/auth';

const isDev = import.meta.env.DEV;

export function logAuthDebug(message: string, detail?: unknown): void {
  if (isDev) {
    console.debug(`[auth] ${message}`, detail ?? '');
  }
}

export function logAuthError(message: string, error?: unknown): void {
  if (isDev) {
    console.error(`[auth] ${message}`, error ?? '');
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    error instanceof AuthError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as AuthError).name === 'AuthError' &&
      'code' in error)
  );
}

export function mapToAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof ApiClientError) {
    logAuthError('API error', { status: error.statusCode, code: error.code, message: error.message });

    if (error.statusCode === 0 || error.code === 'NETWORK_ERROR') {
      return new AuthError('NETWORK_ERROR', 'Network error. Please check your connection and try again.');
    }

    if (error.statusCode >= 500) {
      return new AuthError('SERVER_ERROR', 'Server unavailable. Please try again later.');
    }

    const codeMap: Record<string, AuthErrorCode> = {
      INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
      EMAIL_EXISTS: 'EMAIL_EXISTS',
      VALIDATION_ERROR: 'REQUIRED_FIELDS',
      ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
      USER_NOT_FOUND: 'USER_NOT_FOUND',
      SESSION_EXPIRED: 'SESSION_EXPIRED',
      UNAUTHORIZED: 'UNAUTHORIZED',
      FORBIDDEN: 'FORBIDDEN',
      INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
      RESET_TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',
      SMTP_NOT_CONFIGURED: 'SMTP_NOT_CONFIGURED',
      EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
      RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
      WEAK_PASSWORD: 'WEAK_PASSWORD',
      PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
    };

    const mappedCode = codeMap[error.code] ?? 'UNKNOWN_ERROR';
    const message = error.message || defaultMessageForCode(mappedCode);

    return new AuthError(mappedCode, message);
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AuthError('NETWORK_ERROR', 'Network error. Please check your connection and try again.');
  }

  logAuthError('Unhandled auth error', error);
  return new AuthError('UNKNOWN_ERROR', 'Something went wrong. Please try again.');
}

function defaultMessageForCode(code: AuthErrorCode): string {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password.';
    case 'INVALID_EMAIL':
      return 'Please enter a valid email address.';
    case 'INVALID_PASSWORD':
      return 'Incorrect password.';
    case 'USER_NOT_FOUND':
      return 'User does not exist.';
    case 'ACCOUNT_DISABLED':
      return 'Your account has been deactivated. Please contact support.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again.';
    case 'SERVER_ERROR':
      return 'Server unavailable. Please try again later.';
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
    case 'UNAUTHORIZED':
      return 'Authentication required. Please sign in.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'EMAIL_EXISTS':
      return 'An account with this email already exists.';
    case 'REQUIRED_FIELDS':
      return 'Please fill in all required fields.';
    case 'INVALID_RESET_TOKEN':
    case 'RESET_TOKEN_EXPIRED':
      return 'This password reset link is invalid or has expired.';
    case 'SMTP_NOT_CONFIGURED':
      return 'Email service is not configured. Contact the administrator.';
    case 'EMAIL_SEND_FAILED':
      return 'Failed to send email. Please try again later.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many requests. Please slow down and try again later.';
    case 'WEAK_PASSWORD':
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
    case 'PASSWORD_MISMATCH':
      return 'Passwords do not match.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function authErrorToastMessage(error: AuthError): { title: string; description: string } {
  return {
    title: 'Sign in failed',
    description: error.message,
  };
}
