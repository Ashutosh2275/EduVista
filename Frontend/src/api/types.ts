export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiValidationDetail {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiValidationDetail[];
  };
  statusCode: number;
  requestId?: string;
}

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: ApiValidationDetail[]
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
