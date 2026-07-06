import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

/**
 * 404 Not Found Handler
 *
 * Must be registered AFTER all route definitions and BEFORE the error middleware.
 * Catches all requests that didn't match any route.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = {
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
    statusCode: HTTP_STATUS.NOT_FOUND,
    requestId: req.requestId,
    hint: 'Check the API documentation at /api/v1/docs for available endpoints.',
  };

  next(Object.assign(new Error(error.error.message), { statusCode: HTTP_STATUS.NOT_FOUND, code: ERROR_CODES.NOT_FOUND }));
}
