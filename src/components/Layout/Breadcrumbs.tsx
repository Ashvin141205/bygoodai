import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-neutral-500 mb-4 overflow-x-auto py-1">
      <button
        type="button"
        onClick={() => onNavigate?.('/')}
        className="flex items-center gap-1 hover:text-neutral-900 transition-colors cursor-pointer"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
            {isLast || (!item.href && !item.onClick) ? (
              <span className="font-medium text-neutral-900 truncate max-w-[200px]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.href) {
                    onNavigate?.(item.href);
                  }
                }}
                className="hover:text-neutral-900 transition-colors cursor-pointer truncate max-w-[150px]"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
