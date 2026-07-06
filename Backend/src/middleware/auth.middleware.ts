import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';
import { ApiError } from '../utils/ApiError';
import { ERROR_CODES } from '../constants';
import type { AuthenticatedUser } from '../types/auth.types';

/**
 * Authentication Middleware — verifyToken
 *
 * Validates the JWT access token from the Authorization header.
 * On success, attaches the decoded payload to req.user.
 * On failure, forwards an ApiError to the error middleware.
 *
 * Usage:
 *   router.get('/protected', verifyToken, controller)
 *
 * Token must be sent as:
 *   Authorization: Bearer <access_token>
 */
export function verifyToken(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw ApiError.unauthorized(
        'No authorization header provided. Please include "Authorization: Bearer <token>".',
        ERROR_CODES.TOKEN_MISSING
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized(
        'Invalid authorization format. Expected "Authorization: Bearer <token>".',
        ERROR_CODES.INVALID_TOKEN
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.trim() === '') {
      throw ApiError.unauthorized(
        'Access token is missing from the Authorization header.',
        ERROR_CODES.TOKEN_MISSING
      );
    }

    // Verify and decode the JWT
    const decoded = verifyAccessToken(token);

    const user: AuthenticatedUser = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional Auth Middleware — verifyTokenOptional
 *
 * Like verifyToken, but does NOT block the request if no token is provided.
 * Useful for public endpoints that have enhanced features when authenticated.
 *
 * Usage:
 *   router.get('/colleges', verifyTokenOptional, controller)
 */
export function verifyTokenOptional(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        const user: AuthenticatedUser = {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
        };
        req.user = user;
      }
    }

    next();
  } catch {
    // Silently ignore invalid tokens for optional auth
    next();
  }
}
