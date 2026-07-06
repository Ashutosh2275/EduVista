import { Request } from 'express';
import { PaginationMeta } from '../types';
import { PAGINATION } from '../constants';

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parses and validates pagination parameters from query string.
 * Enforces hard limits to prevent abuse.
 */
export function parsePagination(
  req: Request,
  defaultLimit: number = PAGINATION.DEFAULT_LIMIT
): ParsedPagination {
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);

  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : PAGINATION.DEFAULT_PAGE;
  const limit = !isNaN(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, PAGINATION.MAX_LIMIT)
    : defaultLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds a PaginationMeta object.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
