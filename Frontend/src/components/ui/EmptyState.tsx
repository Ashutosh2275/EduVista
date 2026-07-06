import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizes = {
    sm: { icon: 'w-16 h-16', title: 'text-heading-md', description: 'text-body-sm' },
    md: { icon: 'w-24 h-24', title: 'text-heading-lg', description: 'text-body' },
    lg: { icon: 'w-32 h-32', title: 'text-heading-xl', description: 'text-body-sm' },
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 animate-fade-in',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            sizes[size].icon,
            'flex items-center justify-center rounded-2xl bg-accent/10 text-accent mb-6'
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn('font-heading font-semibold text-primary', sizes[size].title)}>
        {title}
      </h3>
      {description && (
        <p className={cn('text-muted mt-2 max-w-md', sizes[size].description)}>{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please try again.',
  action,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      }
      title={title}
      description={description}
      size="md"
      action={action}
    />
  );
}

export function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-8">
      <EmptyState
        icon={
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-4.827c-.644-.529-.947-1.364-.89-2.219l.29-3.447a1.5 1.5 0 00-1.196-1.612l-2.56-.476a1.5 1.5 0 00-1.5.398l-2.56 2.6a1.5 1.5 0 00-.398 1.5l.476 2.56c.075.406.27.778.558 1.076l5.457 5.457zM21 21l-5.457-5.457m0 0a1.5 1.5 0 10-2.121-2.121m2.121 2.121L21 21"
            />
          </svg>
        }
        title="We'll be right back"
        description="We're performing scheduled maintenance. Please check back in a few minutes."
        size="lg"
      />
    </main>
  );
}
