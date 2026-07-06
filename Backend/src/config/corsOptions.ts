import { CorsOptions } from 'cors';
import env from './env';
import logger from '../utils/logger';

/**
 * CORS configuration.
 * - In development: permissive (logs unknown origins as warnings)
 * - In production: strict whitelist
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) such as Postman, curl
    if (!origin) {
      return callback(null, true);
    }

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    if (env.NODE_ENV === 'development') {
      logger.warn(`[CORS] Unknown origin allowed in development: ${origin}`);
      return callback(null, true);
    }

    logger.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
  },

  credentials: true,               // Allow cookies (refresh token)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400,                   // Cache preflight for 24h
  optionsSuccessStatus: 200,       // IE11 compatibility
};

export default corsOptions;
