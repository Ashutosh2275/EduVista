import { FilterQuery } from 'mongoose';

/**
 * Builds a case-insensitive regex filter for a field.
 */
export function buildRegexFilter(value?: string): RegExp | undefined {
  if (!value || !value.trim()) return undefined;
  return new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

/**
 * Builds a $text search query (requires MongoDB text index).
 */
export function buildTextSearchFilter(query?: string): FilterQuery<unknown> {
  if (!query || !query.trim()) return {};
  return { $text: { $search: query.trim() } };
}

/**
 * Builds a numeric range filter.
 * @example buildRangeFilter('fees.min', 10000, 500000)
 */
export function buildRangeFilter<T>(
  field: string,
  min?: number,
  max?: number
): FilterQuery<T> {
  const filter: Record<string, unknown> = {};

  if (min !== undefined && !isNaN(min)) {
    filter[field] = { ...(filter[field] as object || {}), $gte: min };
  }

  if (max !== undefined && !isNaN(max)) {
    filter[field] = { ...(filter[field] as object || {}), $lte: max };
  }

  return filter as FilterQuery<T>;
}

/**
 * Merges multiple partial filter objects into a single filter.
 * Ignores empty objects.
 */
export function mergeFilters<T>(...filters: FilterQuery<T>[]): FilterQuery<T> {
  return filters.reduce((acc, filter) => {
    if (filter && Object.keys(filter).length > 0) {
      return { ...acc, ...filter };
    }
    return acc;
  }, {} as FilterQuery<T>);
}

/**
 * Builds a filter from an array of enum values.
 * @example buildArrayFilter('stream', ['engineering', 'medical'])
 */
export function buildArrayFilter<T>(
  field: string,
  values?: string[]
): FilterQuery<T> {
  if (!values || values.length === 0) return {} as FilterQuery<T>;
  return { [field]: { $in: values } } as FilterQuery<T>;
}
