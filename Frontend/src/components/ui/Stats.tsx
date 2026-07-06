import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = '',
  prefix = '',
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  const formatValue = (val: number) => {
    if (value >= 1000) {
      return (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'K+';
    }
    return val.toFixed(decimals);
  };

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  animate?: boolean;
}

export function StatCard({
  value,
  label,
  icon,
  trend,
  trendValue,
  className,
  animate = true,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 p-6 rounded-2xl bg-surface shadow-soft transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
      )}
      <div>
        <p className="text-display-sm font-heading font-semibold text-primary">
          {animate && typeof numericValue === 'number' && !isNaN(numericValue) ? (
            <AnimatedCounter value={numericValue} suffix={typeof value === 'string' && value.includes('+') ? '+' : ''} />
          ) : (
            value
          )}
        </p>
        <p className="text-body-sm text-muted">{label}</p>
        {trend && (
          <div className={cn('flex items-center gap-1 mt-1 text-body-xs')}>
            <span
              className={cn(
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-error',
                trend === 'neutral' && 'text-muted'
              )}
            >
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
