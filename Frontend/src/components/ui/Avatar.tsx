import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { images } from '../../utils/images';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  shape = 'circle',
  className,
}: AvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src || images.fallback);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || images.fallback);
    setImgError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-body-sm',
    lg: 'w-12 h-12 text-body',
    xl: 'w-16 h-16 text-heading-md',
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-xl',
  };

  const initials = fallback?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden bg-accent/10 text-accent font-medium shrink-0',
        sizes[size],
        shapes[shape],
        className
      )}
    >
      {showImage ? (
        <img
          src={currentSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            if (currentSrc !== images.fallback) {
              setCurrentSrc(images.fallback);
            } else {
              setImgError(true);
            }
          }}
        />
      ) : (
        <span className="uppercase">{initials || fallback}</span>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt?: string; fallback?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const sizes = {
    xs: 'w-6 h-6 text-xs -ml-2 first:ml-0',
    sm: 'w-8 h-8 text-sm -ml-2 first:ml-0',
    md: 'w-10 h-10 text-body-sm -ml-3 first:ml-0',
    lg: 'w-12 h-12 text-body -ml-4 first:ml-0',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className={cn(sizes[size], 'border-2 border-surface')}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            sizes[size],
            'rounded-full bg-background text-muted font-medium flex items-center justify-center border-2 border-surface'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
