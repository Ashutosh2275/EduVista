import { useState, useEffect, type ImgHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { images } from '../../utils/images';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = images.fallback,
  ...props
}: ImageWithFallbackProps) {
  const resolvedSrc = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setFailed(false);
  }, [src, fallbackSrc]);

  if (failed) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-accent/60',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <svg className="w-1/3 h-1/3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
