import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Option {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
}

interface DropdownProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  size = 'md',
  fullWidth,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizes = {
    sm: 'px-3 py-2 text-body-xs',
    md: 'px-4 py-3 text-body-sm',
    lg: 'px-5 py-4 text-body',
  };

  return (
    <div ref={containerRef} className={cn('relative', fullWidth && 'w-full', className)}>
      {label && (
        <label className="block text-body-sm font-medium text-primary mb-1.5">{label}</label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'form-field flex items-center justify-between w-full rounded-xl border border-border bg-surface',
          'transition-all duration-200',
          'hover:border-primary/30 focus:outline-none focus-visible:outline-none',
          sizes[size],
          error && 'border-error',
          isOpen && 'border-accent/50 shadow-soft'
        )}
      >
        <span className={cn('flex items-center gap-2', !selectedOption && 'text-muted')}>
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 text-muted shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-large border border-border overflow-hidden z-50 animate-slide-down">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
                  'hover:bg-background',
                  value === option.value ? 'bg-accent/10 text-accent' : 'text-primary'
                )}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  <div>
                    <p className="text-body-sm font-medium">{option.label}</p>
                    {option.description && (
                      <p className="text-body-xs text-muted">{option.description}</p>
                    )}
                  </div>
                </span>
                {value === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <span className="text-body-xs text-error">{error}</span>}
    </div>
  );
}
