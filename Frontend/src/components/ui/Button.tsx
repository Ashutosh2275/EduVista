import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const filledTextStyles =
  '!text-white hover:!text-white active:!text-white disabled:!text-white [&_svg]:!text-white';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isFilled = variant === 'primary' || variant === 'secondary';

    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out-expo',
      'rounded-full focus:outline-none focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      variant === 'primary' && 'btn-solid-primary focus-visible:ring-white/30',
      variant === 'secondary' && 'btn-solid-secondary focus-visible:ring-accent/30',
      !isFilled && 'focus-visible:ring-accent/25',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      fullWidth && 'w-full'
    );

    const variants = {
      primary: cn(
        'bg-primary',
        'hover:bg-primary/90 hover:shadow-medium hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-none'
      ),
      secondary: cn(
        'bg-accent',
        'hover:bg-accent-dark hover:shadow-glow hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-none'
      ),
      ghost: cn(
        'bg-transparent text-primary',
        'hover:bg-primary/5 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      outline: cn(
        'bg-transparent text-primary border border-border',
        'hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      link: cn(
        'bg-transparent text-accent underline-offset-4',
        'hover:underline hover:text-accent-dark'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-body-xs',
      md: 'px-6 py-2.5 text-body-sm',
      lg: 'px-8 py-3 text-body',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          variants[variant],
          className,
          isFilled && filledTextStyles
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
