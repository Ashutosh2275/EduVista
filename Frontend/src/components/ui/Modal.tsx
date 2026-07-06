import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  showClose = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[90vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-surface rounded-3xl shadow-large w-full max-h-[90dvh] flex flex-col animate-scale-in',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-4 sm:p-6 pb-0 shrink-0">
            <div className="min-w-0 pr-4">
              {title && (
                <h2 className="text-heading-lg font-semibold text-primary">{title}</h2>
              )}
              {description && (
                <p className="text-body-sm text-muted mt-1">{description}</p>
              )}
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 -mr-2 -mt-2 shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}
