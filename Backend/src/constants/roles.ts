/**
 * User Roles
 * Role-based access control values.
 */
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role Hierarchy
 * Higher number = more permissions.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
};

/**
 * Check if role has sufficient privileges.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
