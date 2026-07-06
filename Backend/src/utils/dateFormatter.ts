/**
 * Date formatter utilities.
 */

/**
 * Formats a Date to a human-readable string.
 * @example formatDate(new Date()) → '5 Jul 2026'
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns a relative time string.
 * @example timeAgo(new Date(Date.now() - 3600000)) → '1 hour ago'
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4, 'week'],
    [12, 'month'],
    [Infinity, 'year'],
  ];

  let unit = seconds;
  let label = 'second';

  for (const [divisor, name] of intervals) {
    if (unit < divisor) {
      label = name;
      break;
    }
    unit = Math.floor(unit / divisor);
    label = name;
  }

  const plural = unit !== 1 ? 's' : '';
  return `${unit} ${label}${plural} ago`;
}

/**
 * Returns true if a date is in the past.
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Returns a date N minutes from now.
 */
export function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Returns a date N days from now.
 */
export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
