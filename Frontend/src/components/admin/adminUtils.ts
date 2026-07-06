import type { BadgeProps } from '../ui/Badge';

export function getStatusBadgeVariant(status?: string): BadgeProps['variant'] {
  switch (status) {
    case 'published':
    case 'closed':
      return 'success';
    case 'archived':
    case 'new':
      return 'warning';
    case 'draft':
    case 'contacted':
    case 'in-progress':
      return 'accent';
    default:
      return 'outline';
  }
}

export function formatStatusLabel(status?: string): string {
  if (!status) return 'Unknown';
  return status.replace(/-/g, ' ');
}
