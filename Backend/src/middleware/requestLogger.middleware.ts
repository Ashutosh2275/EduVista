import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

/**
 * Request Logger Middleware
 *
 * Assigns a unique X-Request-ID to every incoming request.
 * Logs the request start and response completion with timing info.
 *
 * Exposed via response header: X-Request-ID
 * Attached to req.requestId for use in error logs.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate or use provided request ID (allows tracing across services)
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const startTime = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level](`← ${req.method} ${req.originalUrl} ${res.statusCode} [${duration}ms]`, {
      requestId,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });
  });

  next();
}
