import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      iconPosition = 'left',
      size = 'md',
      fullWidth,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'form-field inline-flex items-center bg-surface border border-border rounded-xl',
      'placeholder:text-muted/60',
      fullWidth && 'w-full'
    );

    const sizes = {
      sm: 'px-3 py-2 text-body-xs',
      md: 'px-4 py-3 text-body-sm',
      lg: 'px-5 py-4 text-body',
    };

    const inputSizes = {
      sm: 'text-body-xs',
      md: 'text-body-sm',
      lg: 'text-body',
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-body-sm font-medium text-primary">
            {label}
          </label>
        )}
        <div className={cn(baseStyles, sizes[size], error && 'border-error', className)}>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0 text-muted [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          )}
          <input
            ref={ref}
            className={cn(
              'form-control flex-1 bg-transparent border-none outline-none text-primary focus:outline-none focus-visible:outline-none',
              inputSizes[size]
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="shrink-0 text-muted [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          )}
        </div>
        {error && <span className="text-body-xs text-error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
