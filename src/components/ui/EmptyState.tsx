import React from 'react';
import { Button } from './Button';
import { Search, FileQuestion, ArrowRight } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 mb-3.5 shadow-2xs">
        {icon || <FileQuestion className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-bold text-neutral-900 tracking-tight">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
