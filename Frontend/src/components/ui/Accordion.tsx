import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
  variant = 'default',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const variants = {
    default: 'border border-border rounded-2xl overflow-hidden divide-y divide-border',
    card: 'space-y-3',
    minimal: 'space-y-2 divide-y divide-border-light',
  };

  const itemVariants = {
    default: '',
    card: 'bg-surface rounded-2xl shadow-soft',
    minimal: '',
  };

  return (
    <div className={cn(variants[variant], className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div key={item.id} className={cn(itemVariants[variant], variant === 'card' && isOpen && 'shadow-medium')}>
            <button
              onClick={() => toggleItem(item.id)}
              className={cn(
                'flex items-center justify-between w-full text-left transition-colors',
                variant === 'default' && 'px-6 py-4 hover:bg-background hover:bg-background/50',
                variant === 'card' && 'px-6 py-4',
                variant === 'minimal' && 'px-4 py-3'
              )}
            >
              <span className="font-medium text-primary text-body-sm pr-4">{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-muted shrink-0 transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-out-expo',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div
                className={cn(
                  'text-body-sm text-muted',
                  variant === 'default' && 'px-6 pb-4',
                  variant === 'card' && 'px-6 pb-4',
                  variant === 'minimal' && 'px-4 pb-3'
                )}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
