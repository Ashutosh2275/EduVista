import { SortOrder } from 'mongoose';

export type SortDirection = 'asc' | 'desc';
export type SortObject = Record<string, SortOrder>;

/**
 * Parses a sort query string into a Mongoose sort object.
 *
 * Supports:
 *  - 'rating'       → { rating: -1 }  (desc by default)
 *  - 'fees_asc'     → { 'fees.min': 1 }
 *  - 'fees_desc'    → { 'fees.min': -1 }
 *  - '-rating'      → { rating: -1 }  (minus prefix = desc)
 *  - 'ranking_asc'  → { 'ranking.national': 1 }
 */
export function parseSortQuery(sortParam?: string, defaultSort?: SortObject): SortObject {
  if (!sortParam) return defaultSort || { createdAt: -1 };

  // Field alias map — maps sort keys to actual Mongoose field paths
  const SORT_FIELD_MAP: Record<string, string> = {
    rating: 'rating',
    fees: 'fees.min',
    fees_low: 'fees.min',
    fees_high: 'fees.max',
    ranking: 'ranking.national',
    placement: 'placementRate',
    package: 'averagePackage',
    name: 'name',
    date: 'createdAt',
    newest: 'createdAt',
    oldest: 'createdAt',
    views: 'viewCount',
    colleges: 'collegesCount',
  };

  // Direction suffix map
  const DIRECTION_MAP: Record<string, SortOrder> = {
    asc: 1,
    desc: -1,
    low: 1,
    high: -1,
  };

  // Handle minus prefix (-rating → desc)
  let direction: SortOrder = -1;
  let key = sortParam;

  if (key.startsWith('-')) {
    direction = -1;
    key = key.slice(1);
  }

  // Handle _asc / _desc / _low / _high suffixes
  const parts = key.split('_');
  const suffix = parts[parts.length - 1];

  if (DIRECTION_MAP[suffix] !== undefined) {
    direction = DIRECTION_MAP[suffix];
    key = parts.slice(0, -1).join('_');
  }

  // Resolve field alias
  const field = SORT_FIELD_MAP[key] || SORT_FIELD_MAP[key.toLowerCase()] || key;

  return { [field]: direction };
}

/**
 * Builds a simple sort object directly from field and direction.
 */
export function buildSort(field: string, direction: SortDirection = 'desc'): SortObject {
  return { [field]: direction === 'desc' ? -1 : 1 };
}
