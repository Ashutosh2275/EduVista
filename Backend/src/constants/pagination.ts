/**
 * Pagination defaults and limits.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,

  // Per-resource limits
  COLLEGES_LIMIT: 12,
  COURSES_LIMIT: 12,
  INSIGHTS_LIMIT: 9,
  ENQUIRIES_LIMIT: 20,
  USERS_LIMIT: 25,
  SEARCH_SUGGESTIONS_LIMIT: 5,

  // Wishlist
  MAX_WISHLIST_SIZE: 50,

  // Compare
  MAX_COMPARE_COLLEGES: 3,

  // Compare history
  MAX_COMPARE_HISTORY: 10,

  // Search history per user
  MAX_SEARCH_HISTORY: 10,
} as const;
