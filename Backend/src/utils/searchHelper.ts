import { Request } from 'express';
import { FilterQuery } from 'mongoose';

/**
 * Sanitizes a search query string.
 * Strips dangerous characters that could cause regex ReDoS.
 */
export function sanitizeSearchQuery(q?: string): string {
  if (!q || typeof q !== 'string') return '';
  return q.trim()
    .replace(/[<>]/g, '') // Strip HTML-like chars
    .slice(0, 200);       // Hard cap at 200 chars
}

/**
 * Builds a MongoDB $or text search filter across multiple fields.
 * Uses $regex for flexible matching on un-indexed fields.
 *
 * @param query - The sanitized search string
 * @param fields - The document fields to search across
 *
 * @example
 * buildSearchFilter('iit delhi', ['name', 'shortName', 'location.city'])
 * // → { $or: [{ name: /iit delhi/i }, { shortName: /iit delhi/i }, ...] }
 */
export function buildSearchFilter<T>(
  query: string,
  fields: string[]
): FilterQuery<T> {
  if (!query) return {} as FilterQuery<T>;

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(safeQuery, 'i');

  return {
    $or: fields.map((field) => ({ [field]: regex })),
  } as FilterQuery<T>;
}

/**
 * Parses the search query `q` from the request.
 */
export function parseSearchQuery(req: Request): string {
  return sanitizeSearchQuery(req.query.q as string);
}

/**
 * Slugifies a string for URL-safe identifiers.
 * @example slugify('IIT Delhi') → 'iit-delhi'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')       // Remove non-word chars (except hyphens)
    .replace(/--+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');      // Trim leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if the base slug already exists.
 * @example uniqueSlug('iit-delhi', ['iit-delhi']) → 'iit-delhi-2'
 */
export function uniqueSlug(base: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(base)) return base;

  let counter = 2;
  let candidate = `${base}-${counter}`;

  while (existingSlugs.includes(candidate)) {
    counter++;
    candidate = `${base}-${counter}`;
  }

  return candidate;
}
