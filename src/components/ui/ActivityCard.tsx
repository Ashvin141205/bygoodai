import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Clock, Play, Trash2, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../../types';
import { formatDate } from '../../lib/utils';

export interface ActivityCardProps {
  item: HistoryItem;
  onRerun: (toolSlug: string, inputPayload: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (path: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  onRerun,
  onDelete,
  onNavigate,
}) => {
  const status = item.status || (item.isSuccess !== false ? 'SUCCESS' : 'ERROR');
  const inputSnippet = item.inputPayload || item.inputSnippet || '';
  const outputSnippet = item.outputPayload || item.outputSnippet || '';

  return (
    <Card className="p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate(`/tools/${item.toolSlug}`)}
            className="text-xs font-bold text-neutral-900 hover:underline truncate cursor-pointer text-left"
          >
            {item.toolName}
          </button>
          <Badge
            variant={status === 'SUCCESS' ? 'success' : 'error'}
            size="sm"
          >
            {status}
          </Badge>
          <span className="text-[10px] font-mono text-neutral-400">
            {item.executionTimeMs}ms
          </span>
        </div>
        <p className="text-[11px] font-mono text-neutral-500 truncate max-w-md">
          {inputSnippet ? `${inputSnippet.slice(0, 100)}...` : 'Empty input'}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-neutral-400">
          <Clock className="h-3 w-3" />
          <span>{formatDate(item.timestamp)}</span>
          <span>•</span>
          <span>{outputSnippet ? `${outputSnippet.length} chars output` : 'No output'}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Play className="h-3 w-3 text-emerald-600" />}
          onClick={() => onRerun(item.toolSlug, inputSnippet)}
          className="h-7 text-xs px-2.5"
        >
          Re-run
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-7 w-7 text-neutral-400 hover:text-red-600"
          aria-label="Delete history item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};
