import { Response } from 'express';
import { PaginationMeta } from '../types';

/**
 * ApiResponse — standardized HTTP response helper.
 *
 * Every successful API response is sent through one of these methods,
 * guaranteeing a consistent response envelope across the entire application.
 *
 * Envelope shape:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... },
 *   "pagination": { ... }  // optional
 * }
 */
export class ApiResponse {
  /**
   * Send a 200 OK response.
   */
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    pagination?: PaginationMeta
  ): Response {
    const body: Record<string, unknown> = {
      success: true,
      message,
      data,
    };

    if (pagination) {
      body.pagination = pagination;
    }

    return res.status(200).json(body);
  }

  /**
   * Send a 201 Created response.
   */
  static created<T>(res: Response, data: T, message = 'Created successfully.'): Response {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a 204 No Content response.
   * Note: 204 responses must not include a body.
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a paginated list response.
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message = 'Data retrieved successfully.'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

// ────────────────────────────────────────────────────────────
// Pagination Builder
// ────────────────────────────────────────────────────────────

/**
 * Builds a PaginationMeta object from raw counts and query params.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default ApiResponse;
