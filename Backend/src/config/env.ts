import dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '../types';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Validates that a required environment variable is set.
 * Throws a descriptive error if missing in production.
 */
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;

  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `[Config] Missing required environment variable: ${key}\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `Reference: .env.example`
      );
    }
    console.warn(`[Config] Warning: Environment variable "${key}" is not set. Using empty string.`);
    return '';
  }

  return value;
}

function requireNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`[Config] Environment variable "${key}" must be a number. Got: "${value}"`);
  }
  return parsed;
}

function requireBoolean(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

/**
 * Typed, validated environment configuration.
 * Import this instead of process.env directly.
 *
 * @example
 * import env from '@config/env';
 * const port = env.PORT;
 */
const env: EnvConfig = {
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  PORT: requireNumber('PORT', 5000),

  // Database
  MONGODB_URI: requireEnv(
    'MONGODB_URI',
    'mongodb://localhost:27017/eduvista'
  ),

  // JWT
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_production'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
  JWT_ACCESS_EXPIRE: requireEnv('JWT_ACCESS_EXPIRE', '15m'),
  JWT_REFRESH_EXPIRE_DAYS: requireNumber('JWT_REFRESH_EXPIRE_DAYS', 7),
  JWT_REFRESH_EXPIRE_REMEMBER_DAYS: requireNumber('JWT_REFRESH_EXPIRE_REMEMBER_DAYS', 30),

  // Password Reset
  PASSWORD_RESET_EXPIRE_MINUTES: requireNumber('PASSWORD_RESET_EXPIRE_MINUTES', 10),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET', ''),

  // Email
  SMTP_HOST: requireEnv('SMTP_HOST', 'smtp.mailtrap.io'),
  SMTP_PORT: requireNumber('SMTP_PORT', 587),
  SMTP_SECURE: requireBoolean('SMTP_SECURE', false),
  SMTP_USER: requireEnv('SMTP_USER', ''),
  SMTP_PASS: requireEnv('SMTP_PASS', ''),
  SMTP_FROM_NAME: requireEnv('SMTP_FROM_NAME', 'EduVista'),
  SMTP_FROM_EMAIL: requireEnv('SMTP_FROM_EMAIL', 'noreply@eduvista.com'),

  // CORS — always include FRONTEND_URL in the allowed origins list
  FRONTEND_URL: requireEnv('FRONTEND_URL', 'http://localhost:5173'),
  ALLOWED_ORIGINS: (() => {
    const frontendUrl = requireEnv('FRONTEND_URL', 'http://localhost:5173');
    const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (frontendUrl && !origins.includes(frontendUrl)) {
      origins.push(frontendUrl);
    }

    return origins;
  })(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: requireNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: requireNumber('RATE_LIMIT_MAX_REQUESTS', 200),
  AUTH_RATE_LIMIT_WINDOW_MS: requireNumber('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX_REQUESTS: requireNumber('AUTH_RATE_LIMIT_MAX_REQUESTS', 10),

  // Logging
  LOG_LEVEL: requireEnv('LOG_LEVEL', 'debug'),
  LOG_DIR: requireEnv('LOG_DIR', 'logs'),

  // File Upload
  MAX_FILE_SIZE_MB: requireNumber('MAX_FILE_SIZE_MB', 5),
};

// Warn if using default JWT secrets in production
if (env.NODE_ENV === 'production') {
  if (
    env.JWT_ACCESS_SECRET.includes('dev_') ||
    env.JWT_REFRESH_SECRET.includes('dev_')
  ) {
    throw new Error(
      '[Config] CRITICAL: Default JWT secrets detected in production. ' +
      'Please set strong JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file.'
    );
  }
}

export default env;
