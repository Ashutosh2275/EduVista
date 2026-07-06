import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import logger from '../utils/logger';
import env from '../config/env';

// ────────────────────────────────────────────────────────────
// Mongoose Error Converters
// ────────────────────────────────────────────────────────────

function handleMongooseCastError(err: MongooseError.CastError): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.BAD_REQUEST,
    `Invalid value "${err.value}" for field "${err.path}". Expected type: ${err.kind}.`
  );
}

function handleMongooseValidationError(err: MongooseError.ValidationError): ApiError {
  const details = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
    value: (e as MongooseError.ValidatorError).value,
  }));

  return new ApiError(
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ERROR_CODES.VALIDATION_ERROR,
    'Mongoose validation failed.',
    details
  );
}

function handleMongoDuplicateKeyError(err: MongoError): ApiError {
  // Extract the duplicate field name from the error message
  const field = err.message.match(/index: (\w+)_\d+ dup key/)?.[1]
    || err.message.match(/key: { (\w+):/)?.[1]
    || 'field';

  return new ApiError(
    HTTP_STATUS.CONFLICT,
    ERROR_CODES.DUPLICATE_KEY,
    `A record with this ${field} already exists. Please use a different value.`
  );
}

// ────────────────────────────────────────────────────────────
// Global Error Handler
// ────────────────────────────────────────────────────────────

/**
 * Centralized error handling middleware.
 *
 * Must be registered LAST in the Express middleware stack.
 * Converts all error types to a consistent JSON response.
 *
 * Handled error types:
 * - ApiError (our custom class) → use as-is
 * - Mongoose CastError (invalid ObjectId) → 400
 * - Mongoose ValidationError → 422
 * - MongoDB Duplicate Key (11000) → 409
 * - JWT errors → 401 (handled in verifyToken, re-caught here as safety)
 * - Unknown errors → 500
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Convert known non-ApiError types ──────────────────────

  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof MongooseError.CastError) {
    error = handleMongooseCastError(err);
  } else if (err instanceof MongooseError.ValidationError) {
    error = handleMongooseValidationError(err);
  } else if ((err as MongoError).code === 11000) {
    error = handleMongoDuplicateKeyError(err as MongoError);
  } else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token.', ERROR_CODES.INVALID_TOKEN);
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token has expired.', ERROR_CODES.TOKEN_EXPIRED);
  } else if (err.message?.includes('CORS')) {
    error = new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, err.message);
  } else {
    error = ApiError.internal();
  }

  // ── Log error ──────────────────────────────────────────────

  const logPayload = {
    statusCode: error.statusCode,
    code: error.code,
    method: req.method,
    url: req.originalUrl,
    requestId: req.requestId,
    userId: req.user?.id,
    ip: req.ip,
  };

  if (error.statusCode >= 500) {
    logger.error(`[Error] ${err.message}`, { ...logPayload, stack: err.stack });
  } else if (error.statusCode >= 400) {
    logger.warn(`[Error] ${err.message}`, logPayload);
  }

  // ── Build response ─────────────────────────────────────────

  const responseBody: Record<string, unknown> = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
    statusCode: error.statusCode,
    requestId: req.requestId,
  };

  // Include stack trace in development only
  if (env.NODE_ENV === 'development' && !error.isOperational) {
    responseBody.stack = err.stack;
  }

  res.status(error.statusCode).json(responseBody);
}
