import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'shimmer' | 'pulse' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}: SkeletonProps) {
  const baseStyles = 'bg-border-light';

  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const animations = {
    shimmer: 'animate-shimmer bg-gradient-to-r from-border-light via-border to-border-light bg-[length:200%_100%]',
    pulse: 'animate-pulse-soft',
    none: '',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], animations[animation], className)}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-soft space-y-4">
      <div className="flex gap-4">
        <Skeleton variant="rounded" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={14} />
        <Skeleton variant="text" height={14} />
        <Skeleton variant="text" width="80%" height={14} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={60} height={24} />
      </div>
    </div>
  );
}

export function CollegeCardSkeleton() {
  return (
    <div className="bg-surface rounded-3xl overflow-hidden shadow-soft">
      <Skeleton variant="rectangular" height={200} />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
          <Skeleton variant="rounded" width={60} height={28} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="text" height={14} />
          <Skeleton variant="text" height={14} />
          <Skeleton variant="text" height={14} />
          <Skeleton variant="text" height={14} />
        </div>
        <Skeleton variant="rounded" height={44} />
      </div>
    </div>
  );
}
