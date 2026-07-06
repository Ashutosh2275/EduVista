import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env';
import { JwtPayload } from '../types';
import { ApiError } from './ApiError';
import { ERROR_CODES } from '../constants';

// ────────────────────────────────────────────────────────────
// Access Token (short-lived JWT)
// ────────────────────────────────────────────────────────────

/**
 * Signs a new JWT access token.
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRE as any,
    issuer: 'eduvista-api',
    audience: 'eduvista-client',
  });
}

/**
 * Verifies a JWT access token and returns its payload.
 * Throws ApiError on failure.
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'eduvista-api',
      audience: 'eduvista-client',
    }) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token has expired.', ERROR_CODES.TOKEN_EXPIRED);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid access token.', ERROR_CODES.INVALID_TOKEN);
    }
    throw ApiError.unauthorized('Token verification failed.', ERROR_CODES.INVALID_TOKEN);
  }
}

// ────────────────────────────────────────────────────────────
// Refresh Token (opaque random string)
// ────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure opaque refresh token.
 * This is stored in the database (hashed) and sent as an httpOnly cookie.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Hashes a refresh token for secure storage.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Returns refresh token expiry date based on "rememberMe" flag.
 */
export function getRefreshTokenExpiry(rememberMe = false): Date {
  const days = rememberMe
    ? env.JWT_REFRESH_EXPIRE_REMEMBER_DAYS
    : env.JWT_REFRESH_EXPIRE_DAYS;

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

// ────────────────────────────────────────────────────────────
// Password Reset Token
// ────────────────────────────────────────────────────────────

/**
 * Generates a password reset token pair:
 * - rawToken: sent to user via email
 * - hashedToken: stored in the database
 */
export function generatePasswordResetToken(): { rawToken: string; hashedToken: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}

/**
 * Returns the password reset token expiry date.
 */
export function getPasswordResetExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + env.PASSWORD_RESET_EXPIRE_MINUTES);
  return expiry;
}

/**
 * Hashes an incoming raw reset token for DB lookup.
 */
export function hashIncomingResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
