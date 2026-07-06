import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

/**
 * Validation Middleware — validate
 *
 * Runs after express-validator validation chains.
 * If any validation errors exist, formats them and throws an ApiError.
 *
 * Usage (in routes):
 *   router.post('/register', registerValidators, validate, registerController)
 *
 * Response on failure:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Validation failed.",
 *     "details": [
 *       { "field": "email", "message": "Must be a valid email.", "value": "bad-email" }
 *     ]
 *   }
 * }
 */
export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : err.type,
      message: err.msg,
      value: err.type === 'field' ? err.value : undefined,
    }));

    return next(ApiError.validationError(details));
  }

  next();
}
