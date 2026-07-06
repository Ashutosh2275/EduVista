import { UserRole } from '../constants/roles';

export type { AuthenticatedUser } from './auth.types';

// =====================
// API Response Types
// =====================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
  };
  statusCode: number;
  requestId?: string;
}

// =====================
// Pagination
// =====================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// =====================
// Validation
// =====================

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

// =====================
// Auth Types
// =====================

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

/** @deprecated Use AuthenticatedUser — kept as alias for JWT request user shape */
export type AuthPayload = Pick<JwtPayload, 'id' | 'role' | 'email'>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
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

// =====================
// Filter / Sort / Search
// =====================

export interface BaseFilterOptions {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CollegeFilterOptions extends BaseFilterOptions {
  type?: 'public' | 'private';
  city?: string;
  state?: string;
  category?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  categories?: string[];
  isFeatured?: boolean;
}

export interface CourseFilterOptions extends BaseFilterOptions {
  stream?: string;
  level?: string;
  mode?: string;
  duration?: string;
  minFees?: number;
  maxFees?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  rating?: number;
  entranceExam?: string;
}

export interface InsightFilterOptions extends BaseFilterOptions {
  category?: string;
  tag?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

// =====================
// Cloudinary
// =====================

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

// =====================
// Environment Config
// =====================

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRE: string;
  JWT_REFRESH_EXPIRE_DAYS: number;
  JWT_REFRESH_EXPIRE_REMEMBER_DAYS: number;
  PASSWORD_RESET_EXPIRE_MINUTES: number;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM_NAME: string;
  SMTP_FROM_EMAIL: string;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  AUTH_RATE_LIMIT_WINDOW_MS: number;
  AUTH_RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  LOG_DIR: string;
  MAX_FILE_SIZE_MB: number;
}
