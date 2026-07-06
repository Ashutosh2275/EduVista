import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  variant?: 'default' | 'glass' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  onClick,
}: CardProps) {
  const baseStyles = cn(
    'rounded-2xl overflow-hidden transition-all duration-300 ease-out-expo',
    onClick && 'cursor-pointer'
  );

  const variants = {
    default: 'bg-surface shadow-soft',
    glass: 'bg-surface/80 backdrop-blur-xl border border-white/20 shadow-medium',
    elevated: 'bg-surface shadow-large',
    outline: 'bg-transparent border border-border',
  };

  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover && 'hover:shadow-large hover:-translate-y-1 hover:border-accent/20';

  return (
    <div
      className={cn(baseStyles, variants[variant], paddingSizes[padding], hoverStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return <div className={cn('flex flex-col gap-1', className)}>{children}</div>;
}

interface CardTitleProps {
  className?: string;
  children: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return <h3 className={cn('font-heading font-semibold text-heading-md text-primary', className)}>{children}</h3>;
}

interface CardDescriptionProps {
  className?: string;
  children: ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return <p className={cn('text-body-sm text-muted', className)}>{children}</p>;
}

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('py-4', className)}>{children}</div>;
}

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>;
}
