import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  const currentTab = activeTab || internalActiveTab;

  const handleChange = (tabId: string) => {
    setInternalActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizes = {
    sm: 'text-body-xs',
    md: 'text-body-sm',
    lg: 'text-body',
  };

  const variants = {
    default: {
      container: 'bg-background rounded-xl p-1',
      tab: 'rounded-lg',
      active: 'bg-surface shadow-soft',
    },
    pills: {
      container: 'gap-2',
      tab: 'rounded-full',
      active: 'bg-primary text-white',
    },
    underline: {
      container: 'border-b border-border gap-4',
      tab: 'pb-3 -mb-px',
      active: 'border-b-2 border-accent text-accent',
    },
  };

  return (
    <div className={cn('overflow-x-auto -mx-1 px-1', className)}>
      <div className={cn('flex flex-nowrap min-w-max sm:min-w-0', variants[variant].container)}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 font-medium transition-all duration-200 shrink-0 whitespace-nowrap',
              sizes[size],
              variants[variant].tab,
              isActive
                ? variants[variant].active
                : 'text-muted hover:text-primary',
              isActive ? 'px-4 py-2' : 'px-4 py-2'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  isActive
                    ? 'bg-accent/20 text-accent'
                    : 'bg-background text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
      </div>
    </div>
  );
}
