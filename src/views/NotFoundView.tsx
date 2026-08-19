import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Terminal, Home, Search, ArrowRight } from 'lucide-react';

export interface NotFoundViewProps {
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate, onOpenSearch }) => {
  return (
    <PageContainer
      title="404 — Route Not Found"
      description="The requested page or developer utility could not be located."
      breadcrumbs={[{ label: '404', current: true }]}
      onNavigate={onNavigate}
    >
      <div className="max-w-xl mx-auto text-center py-12 sm:py-16 space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 shadow-2xs font-mono font-bold text-xl">
          404
        </div>

        <div className="space-y-2">
          <Badge variant="indigo" size="sm">HTTP Status 404</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Developer Route Not Found
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            The tool, documentation section, or workspace path you requested does not exist or may have been relocated.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Home className="h-4 w-4" />}
            onClick={() => onNavigate('/')}
          >
            Return to Home
          </Button>
          {onOpenSearch && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<Search className="h-4 w-4" />}
              onClick={onOpenSearch}
            >
              Search Tools (⌘K)
            </Button>
          )}
        </div>

        {/* Suggested Quick Links */}
        <div className="pt-8 border-t border-neutral-200/80 text-left space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Suggested Quick Routes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('/tools/data/json-formatter')}
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer font-mono"
            >
              <span>/tools/json-formatter</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/tools/developer/regex-tester')}
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer font-mono"
            >
              <span>/tools/regex-tester</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
