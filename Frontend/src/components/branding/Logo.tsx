import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import logoFull from '../../assets/branding/logo.png';
import logoIcon from '../../assets/branding/logo-icon.png';

export type LogoVariant = 'full' | 'wordmark' | 'icon' | 'footer' | 'auth';
export type LogoTheme = 'light' | 'dark';

interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
  imageClassName?: string;
  asLink?: boolean;
  to?: string;
}

const variantConfig: Record<
  LogoVariant,
  { src: string; heightClass: string; alt: string }
> = {
  icon: {
    src: logoIcon,
    heightClass: 'h-9 w-9',
    alt: 'EduVista logo',
  },
  wordmark: {
    src: logoFull,
    heightClass: 'h-14 sm:h-16 w-auto',
    alt: 'EduVista - Discover. Compare. Choose.',
  },
  full: {
    src: logoFull,
    heightClass: 'h-32 sm:h-36 w-auto',
    alt: 'EduVista - Discover. Compare. Choose.',
  },
  footer: {
    src: logoFull,
    heightClass: 'h-36 sm:h-40 w-auto',
    alt: 'EduVista - Discover. Compare. Choose.',
  },
  auth: {
    src: logoFull,
    heightClass: 'h-32 sm:h-36 w-auto',
    alt: 'EduVista - Discover. Compare. Choose.',
  },
};

export function Logo({
  variant = 'wordmark',
  theme = 'light',
  className,
  imageClassName,
  asLink = false,
  to = '/',
}: LogoProps) {
  const config = variantConfig[variant];

  const image = (
    <img
      src={config.src}
      alt={config.alt}
      width={variant === 'icon' ? 36 : undefined}
      height={variant === 'icon' ? 36 : undefined}
      className={cn(
        'block max-w-none shrink-0 object-contain object-left',
        config.heightClass,
        imageClassName
      )}
      decoding="async"
    />
  );

  const content =
    theme === 'dark' ? (
      <span
        className={cn(
          'inline-flex overflow-visible rounded-2xl bg-white p-3 shadow-soft',
          variant === 'icon' && 'p-1.5 rounded-xl',
          (variant === 'footer' || variant === 'auth') && 'p-4'
        )}
      >
        {image}
      </span>
    ) : (
      image
    );

  if (asLink) {
    return (
      <Link
        to={to}
        className={cn('inline-flex shrink-0 items-center overflow-visible', className)}
        aria-label="EduVista - Discover. Compare. Choose."
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={cn('inline-flex shrink-0 items-center overflow-visible', className)}
      role="img"
      aria-label={config.alt}
    >
      {content}
    </span>
  );
}
