import { HTTP_STATUS, HttpStatusCode } from '../constants/httpStatus';
import { ERROR_CODES, ErrorCode } from '../constants/errorCodes';
import { ValidationErrorDetail } from '../types';

/**
 * Custom application error class.
 *
 * Extends the native Error with HTTP context (status code, error code,
 * validation details) so the global error middleware can render
 * consistent JSON responses.
 *
 * @example
 * throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.COLLEGE_NOT_FOUND, 'College not found.');
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode | string;
  public readonly details?: ValidationErrorDetail[];

  /**
   * Flag to distinguish operational errors (expected, user-facing)
   * from programming errors (unexpected, needs investigation).
   */
  public readonly isOperational: boolean;

  constructor(
    statusCode: HttpStatusCode,
    code: ErrorCode | string,
    message: string,
    details?: ValidationErrorDetail[],
    isOperational = true
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper prototype chain (needed for `instanceof` checks)
    Object.setPrototypeOf(this, ApiError.prototype);

    // Captures V8 stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // ─────────────────────────────────────────────────────
  // Static Factories — common error patterns
  // ─────────────────────────────────────────────────────

  static badRequest(message: string, details?: ValidationErrorDetail[]): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, message, details);
  }

  static unauthorized(
    message = 'Authentication required.',
    code: string = ERROR_CODES.UNAUTHORIZED
  ): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, code, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.'): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, message);
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND,
      `${resource} not found.`
    );
  }

  static conflict(message: string, code: string = ERROR_CODES.DUPLICATE_KEY): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, code, message);
  }

  static validationError(details: ValidationErrorDetail[]): ApiError {
    return new ApiError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      'Validation failed. Please check the submitted data.',
      details
    );
  }

  static internal(message = 'An unexpected error occurred. Please try again.'): ApiError {
    return new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
      undefined,
      false // Not operational — requires investigation
    );
  }

  static tooManyRequests(): ApiError {
    return new ApiError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please slow down and try again later.'
    );
  }
}

export default ApiError;
