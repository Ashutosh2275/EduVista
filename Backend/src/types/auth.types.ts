import type { UserRole } from '../constants/roles';

/**
 * Authenticated user claims attached to `req.user` after JWT verification.
 * Mirrors the core fields of `JwtPayload` (without `iat` / `exp`).
 */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email: string;
}
