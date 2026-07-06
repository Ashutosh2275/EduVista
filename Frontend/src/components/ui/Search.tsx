import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface SearchSuggestion {
  id: string;
  text: string;
  type?: 'college' | 'course' | 'location' | 'career';
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  className?: string;
  variant?: 'default' | 'hero';
  autoFocus?: boolean;
  showButton?: boolean;
}

export function SearchBar({
  placeholder = 'Search colleges, courses, careers...',
  suggestions = [],
  value = '',
  onChange,
  onSearch,
  onSuggestionClick,
  className,
  variant = 'default',
  autoFocus = false,
  showButton = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    setDropdownRect(containerRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (!isOpen || suggestions.length === 0) {
      setDropdownRect(null);
      return;
    }

    updateDropdownPosition();

    const handleReposition = () => updateDropdownPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, suggestions.length, query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleSearch = () => {
    onSearch?.(query);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onChange?.(suggestion.text);
    onSuggestionClick?.(suggestion);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    onChange?.('');
    inputRef.current?.focus();
  };

  const variants = {
    default: 'h-12',
    hero: 'h-16 text-lg',
  };

  const showSuggestions = isOpen && suggestions.length > 0 && dropdownRect;

  const suggestionsDropdown = showSuggestions ? (
    <div
      ref={dropdownRef}
      role="listbox"
      aria-label="Search suggestions"
      style={{
        position: 'fixed',
        top: dropdownRect.bottom + 8,
        left: dropdownRect.left,
        width: dropdownRect.width,
        zIndex: 9999,
      }}
      className={cn(
        'search-suggestions-dropdown',
        'bg-surface border border-border rounded-2xl shadow-large overflow-hidden',
        'animate-slide-down-solid'
      )}
    >
      <div className="bg-surface p-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            role="option"
            aria-selected={index === selectedIndex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
              index === selectedIndex
                ? 'bg-accent/10 text-accent'
                : 'hover:bg-background text-primary'
            )}
          >
            {suggestion.icon && (
              <span className="text-muted">{suggestion.icon}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium">{suggestion.text}</p>
              {suggestion.type && (
                <p className="text-body-xs text-muted capitalize">{suggestion.type}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', isOpen && 'z-50', className)}
    >
      <div
        className={cn(
          'form-field flex items-center gap-3 bg-surface rounded-full border border-border',
          variants[variant],
          isOpen && 'border-accent/50 shadow-soft'
        )}
      >
        <Search className="w-5 h-5 text-muted ml-5 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(query.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'form-control flex-1 bg-transparent outline-none focus:outline-none focus-visible:outline-none text-primary placeholder:text-muted/60',
            variant === 'hero' ? 'text-lg' : 'text-body-sm'
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="w-6 h-6 flex items-center justify-center text-muted hover:text-primary transition-colors mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {showButton && (
          <Button
            onClick={handleSearch}
            className="mr-1.5 px-4 sm:px-6 hidden sm:inline-flex shrink-0"
            variant="primary"
            size={variant === 'hero' ? 'lg' : 'md'}
          >
            Search
          </Button>
        )}
      </div>

      {suggestionsDropdown && createPortal(suggestionsDropdown, document.body)}
    </div>
  );
}
