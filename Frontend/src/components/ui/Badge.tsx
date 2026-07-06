import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className,
}: BadgeProps) {
  const baseStyles = cn(
    'inline-flex items-center gap-1.5 font-medium rounded-full',
    'transition-all duration-200'
  );

  const variants = {
    default: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    outline: 'bg-transparent border border-primary/20 text-primary',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-body-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {icon && <span className="shrink-0 [&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
      {children}
    </span>
  );
}
