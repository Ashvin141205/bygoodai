import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  onDismiss,
  ...props
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-red-50/80 border-red-200 text-red-900',
      icon: <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,
    },
  };

  const { bg, icon } = configs[variant];

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed', bg, className)}
      {...props}
    >
      {icon}
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100 cursor-pointer p-0.5"
          aria-label="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
