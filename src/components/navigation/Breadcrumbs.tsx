/**
 * ByGoodAI - Visible Accessible Breadcrumbs Component
 * Semantic navigation trail with Schema.org itemScope/itemType attributes.
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../lib/seo';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={`flex items-center text-xs text-neutral-500 overflow-x-auto py-1 ${className}`}
    >
      <ol
        className="flex items-center space-x-1.5 whitespace-nowrap"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          className="flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1 hover:text-neutral-900 transition-colors cursor-pointer"
            itemProp="item"
          >
            <Home className="h-3.5 w-3.5 text-neutral-400" />
            <span itemProp="name" className="sr-only">Home</span>
          </button>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const position = idx + 2;

          return (
            <li
              key={idx}
              className="flex items-center space-x-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" aria-hidden="true" />

              {isLast ? (
                <span
                  className="font-medium text-neutral-900 truncate max-w-[200px] sm:max-w-xs"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.url)}
                  className="hover:text-neutral-900 transition-colors truncate max-w-[150px] cursor-pointer"
                  itemProp="item"
                >
                  <span itemProp="name">{item.name}</span>
                </button>
              )}
              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
