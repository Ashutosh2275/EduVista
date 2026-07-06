export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  field?: string;
}

export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_DISABLED'
  | 'REQUIRED_FIELDS'
  | 'EMAIL_EXISTS'
  | 'INVALID_PHONE'
  | 'WEAK_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'REGISTRATION_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_RESET_TOKEN'
  | 'RESET_TOKEN_EXPIRED'
  | 'SMTP_NOT_CONFIGURED'
  | 'EMAIL_SEND_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNKNOWN_ERROR';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
