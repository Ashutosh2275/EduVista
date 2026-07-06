import { Request, Response, NextFunction } from 'express';
import { ROLES, UserRole } from '../constants/roles';
import { ApiError } from '../utils/ApiError';

/**
 * Admin Authorization Middleware — requireAdmin
 *
 * Must be used AFTER verifyToken.
 * Ensures the authenticated user has ADMIN role.
 *
 * Usage:
 *   router.delete('/college/:id', verifyToken, requireAdmin, controller)
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(
      ApiError.unauthorized('Authentication required before authorization check.')
    );
  }

  if (req.user.role !== ROLES.ADMIN) {
    return next(
      ApiError.forbidden('Admin access required to perform this action.')
    );
  }

  next();
}

/**
 * Role-based authorization factory.
 * Creates middleware that checks for any of the specified roles.
 *
 * @example
 * router.get('/reports', verifyToken, requireRole(ROLES.ADMIN), controller)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access restricted to: ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
        )
      );
    }

    next();
  };
}

/**
 * Self-or-admin middleware.
 * Allows a user to access their own resource, or an admin to access any.
 *
 * @param paramName - The URL parameter name containing the target user ID
 *
 * @example
 * router.patch('/users/:userId', verifyToken, requireSelfOrAdmin('userId'), controller)
 */
export function requireSelfOrAdmin(paramName = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    const targetId = req.params[paramName];

    if (req.user.role === ROLES.ADMIN) {
      return next(); // Admin can access anyone
    }

    if (req.user.id === targetId) {
      return next(); // User can access their own resource
    }

    next(ApiError.forbidden('You can only access your own resources.'));
  };
}
