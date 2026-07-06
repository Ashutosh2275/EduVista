import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size = 'md',
  showFirstLast = true,
  className,
}: PaginationProps) {
  const sizes = {
    sm: 'w-8 h-8 text-body-xs',
    md: 'w-10 h-10 text-body-sm',
    lg: 'w-12 h-12 text-body',
  };

  const getVisiiblePages = () => {
    const delta = 2;
    const pages: (number | 'ellipsis')[] = [];

    let left = Math.max(2, currentPage - delta);
    let right = Math.min(totalPages - 1, currentPage + delta);

    if (currentPage <= delta + 2) {
      right = Math.min(totalPages - 1, delta * 2 + 2);
    }

    if (currentPage >= totalPages - delta - 1) {
      left = Math.max(2, totalPages - delta * 2 - 1);
    }

    pages.push(1);

    if (left > 2) {
      pages.push('ellipsis');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiiblePages();

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={cn(
            sizes[size],
            'flex items-center justify-center rounded-xl border border-border bg-surface',
            'transition-all duration-200',
            'hover:border-primary/30 hover:bg-background',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-border'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {visiblePages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className={cn(sizes[size], 'flex items-center justify-center text-muted')}>
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              sizes[size],
              'flex items-center justify-center rounded-xl font-medium',
              'transition-all duration-200',
              isActive
                ? 'bg-primary text-white shadow-soft'
                : 'bg-surface border border-border hover:border-primary/30 hover:bg-background'
            )}
          >
            {page}
          </button>
        );
      })}

      {showFirstLast && (
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={cn(
            sizes[size],
            'flex items-center justify-center rounded-xl border border-border bg-surface',
            'transition-all duration-200',
            'hover:border-primary/30 hover:bg-background',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-border'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
}
