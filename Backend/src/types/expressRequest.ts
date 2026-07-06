import type { AuthenticatedUser } from './auth.types';

/**
 * Extends Express Request with strongly typed auth and request metadata.
 * Imported as a side effect from the application entry point so augmentation
 * is always applied (tsc, ts-node, and IDE).
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

export {};
