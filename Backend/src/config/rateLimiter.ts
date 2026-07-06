import rateLimit, { Options } from 'express-rate-limit';
import env from './env';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

// ────────────────────────────────────────────────────────────
// Helper — builds the JSON error response for rate limit hits
// ────────────────────────────────────────────────────────────

const rateLimitHandler: Partial<Options> = {
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests. Please slow down and try again later.',
      },
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    });
  },
};

// ────────────────────────────────────────────────────────────
// Global Limiter — applied to all routes
// ────────────────────────────────────────────────────────────

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,      // Default: 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS,        // Default: 200 requests
  ...rateLimitHandler,
});

// ────────────────────────────────────────────────────────────
// Auth Limiter — stricter, applied to /api/v1/auth/*
// In development: disabled so local testing is never blocked.
// In production: counts failed attempts only (successful logins are skipped).
// ────────────────────────────────────────────────────────────

export const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  ...rateLimitHandler,
  skipSuccessfulRequests: true,
  skip: () => env.NODE_ENV === 'development',
});

// ────────────────────────────────────────────────────────────
// Upload Limiter — for image/file uploads
// ────────────────────────────────────────────────────────────

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,                   // 20 uploads per hour
  ...rateLimitHandler,
});

// ────────────────────────────────────────────────────────────
// Search Limiter — for public search endpoint
// ────────────────────────────────────────────────────────────

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 30,               // 30 searches per minute
  ...rateLimitHandler,
});
