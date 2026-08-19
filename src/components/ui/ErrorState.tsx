import React from 'react';
import { Button } from './Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Execution Error',
  message,
  details,
  onRetry,
  onHome,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-red-200/90 bg-red-50/40 p-6 sm:p-8 space-y-4 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-red-950 tracking-tight">{title}</h4>
          <p className="text-xs text-red-800 leading-relaxed">{message}</p>
        </div>
      </div>

      {details && (
        <div className="rounded-xl border border-red-200/80 bg-white/80 p-3.5 font-mono text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
          {details}
        </div>
      )}

      {(onRetry || onHome) && (
        <div className="flex items-center gap-2 pt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={onRetry}
              className="border-red-200 hover:bg-red-50 hover:text-red-900"
            >
              Retry
            </Button>
          )}
          {onHome && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Home className="h-3.5 w-3.5" />}
              onClick={onHome}
              className="text-neutral-600 hover:text-neutral-900"
            >
              Return Home
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
