const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_URL is not defined. Check your .env.development or .env.production file.');
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
} as const;
