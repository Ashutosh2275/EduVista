import { env } from '../config/env';
import type { ApiErrorResponse, ApiSuccessResponse, PaginationMeta } from './types';
import { ApiClientError } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string | null;
  /** Do not attach Authorization header */
  skipAuth?: boolean;
  /** Do not attempt token refresh on 401 (auth endpoints) */
  skipRefresh?: boolean;
}

let accessTokenGetter: (() => string | null) | null = null;
let tokenRefreshHandler: (() => Promise<string | null>) | null = null;
let onUnauthorized: (() => void) | null = null;

const isDev = import.meta.env.DEV;

export function setAccessTokenGetter(getter: () => string | null): void {
  accessTokenGetter = getter;
}

export function setTokenRefreshHandler(handler: () => Promise<string | null>): void {
  tokenRefreshHandler = handler;
}

export function setOnUnauthorized(handler: () => void): void {
  onUnauthorized = handler;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return base;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

async function parseResponse<T>(response: Response): Promise<{ data: T; pagination?: PaginationMeta }> {
  const text = await response.text();
  if (!text) {
    if (response.ok) return { data: null as T };
    throw new ApiClientError(response.status, 'EMPTY_RESPONSE', 'Empty response from server.');
  }

  let json: ApiSuccessResponse<T> | ApiErrorResponse;
  try {
    json = JSON.parse(text) as ApiSuccessResponse<T> | ApiErrorResponse;
  } catch {
    throw new ApiClientError(response.status, 'PARSE_ERROR', 'Invalid JSON response from server.');
  }

  if (!response.ok || json.success === false) {
    const err = json as ApiErrorResponse;
    if (isDev) {
      console.debug('[api] error response', {
        status: err.statusCode ?? response.status,
        code: err.error?.code,
        message: err.error?.message,
        path: response.url,
      });
    }
    throw new ApiClientError(
      err.statusCode ?? response.status,
      err.error?.code ?? 'API_ERROR',
      err.error?.message ?? 'Request failed.',
      err.error?.details
    );
  }

  const success = json as ApiSuccessResponse<T>;
  return { data: success.data, pagination: success.pagination };
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<{ data: T; pagination?: PaginationMeta }> {
  const { method = 'GET', body, params, token, skipAuth, skipRefresh } = options;
  const authToken = token ?? (skipAuth ? null : accessTokenGetter?.() ?? null);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
  } catch (error) {
    if (isDev) console.error('[api] network failure', { path, error });
    throw new ApiClientError(
      0,
      'NETWORK_ERROR',
      'Network error. Please check your connection and try again.'
    );
  }

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipRefresh &&
    !isRetry &&
    tokenRefreshHandler
  ) {
    const newToken = await tokenRefreshHandler();
    if (newToken) {
      return request<T>(path, { ...options, token: newToken }, true);
    }
    onUnauthorized?.();
    throw new ApiClientError(401, 'SESSION_EXPIRED', 'Session expired. Please sign in again.');
  }

  return parseResponse<T>(response);
}

export const apiClient = {
  get<T>(path: string, params?: RequestOptions['params'], options?: Omit<RequestOptions, 'method' | 'params' | 'body'>) {
    return request<T>(path, { ...options, method: 'GET', params }).then((r) => r.data);
  },

  getWithPagination<T>(path: string, params?: RequestOptions['params'], options?: Omit<RequestOptions, 'method' | 'params' | 'body'>) {
    return request<T>(path, { ...options, method: 'GET', params });
  },

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'POST', body }).then((r) => r.data);
  },

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PUT', body }).then((r) => r.data);
  },

  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PATCH', body }).then((r) => r.data);
  },

  delete<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'DELETE' }).then((r) => r.data);
  },
};
