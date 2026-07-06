const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
} as const;
