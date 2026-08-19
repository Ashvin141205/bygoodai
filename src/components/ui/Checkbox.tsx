import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, onChange, disabled, id, ...props }, ref) => {
    const checkId = id || (label ? 'chk-' + label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label htmlFor={checkId} className={cn('inline-flex items-start gap-2.5 select-none cursor-pointer', disabled && 'cursor-not-allowed opacity-60')}>
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            id={checkId}
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-4 w-4 rounded border border-neutral-300 bg-white transition-all peer-checked:border-neutral-900 peer-checked:bg-neutral-900 peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-focus-visible:ring-offset-1',
              className
            )}
          >
            <Check className="h-3 w-3 text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity m-auto" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-neutral-800">{label}</span>}
            {description && <span className="text-xs text-neutral-500">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
