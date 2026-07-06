import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt.
 * saltRounds=12 is the recommended balance of security vs. performance.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function comparePassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Validates password strength.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function isStrongPassword(password: string): boolean {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return pattern.test(password);
}

/**
 * Password strength levels for UI feedback.
 */
export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'strong';
  return 'very-strong';
}
