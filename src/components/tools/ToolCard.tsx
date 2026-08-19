import React from 'react';
import { ToolItem } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Bookmark, ArrowRight, Zap, Code2, Database, ShieldCheck, Search, Sparkles, Braces, Binary, Fingerprint, FileCode, Globe, FileText, Palette, Cpu } from 'lucide-react';
import { db } from '../../db/client';
import { useToast } from '../ui/Toast';

const ICON_MAP: Record<string, React.ReactNode> = {
  Code2: <Code2 className="h-4 w-4" />,
  Database: <Database className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Braces: <Braces className="h-4 w-4" />,
  Binary: <Binary className="h-4 w-4" />,
  Fingerprint: <Fingerprint className="h-4 w-4" />,
  FileCode: <FileCode className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Cpu: <Cpu className="h-4 w-4" />,
};

export interface ToolCardProps {
  tool: ToolItem;
  onNavigate?: (path: string) => void;
  onSelect?: (slug: string) => void;
  onBookmarkChange?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onNavigate, onSelect, onBookmarkChange }) => {
  const { showToast } = useToast();
  const isSaved = db.isToolSaved(tool.slug);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(tool.slug);
    } else if (onNavigate) {
      onNavigate(`/tools/${tool.category}/${tool.slug}`);
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = db.toggleSaveItem(tool.id, tool.slug, tool.name);
    showToast(saved ? `Added ${tool.name} to bookmarks` : `Removed ${tool.name} from bookmarks`, 'info');
    onBookmarkChange?.();
  };

  const iconElement = ICON_MAP[tool.icon] || <Zap className="h-4 w-4" />;

  return (
    <Card
      hoverEffect
      onClick={handleCardClick}
      className="cursor-pointer flex flex-col justify-between group border-neutral-200/90 hover:border-neutral-400/80 bg-white transition-all shadow-xs hover:shadow-md"
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
            {iconElement}
          </div>
          <div className="flex items-center gap-1.5">
            {tool.isPopular && <Badge variant="default" size="sm">Popular</Badge>}
            {tool.isNew && <Badge variant="indigo" size="sm">New</Badge>}
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSaved ? 'text-amber-500 bg-amber-50' : 'text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark tool'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <CardTitle className="text-sm font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
            {tool.name}
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {tool.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 mt-4 text-[11px] text-neutral-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="capitalize font-sans font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
            {tool.category}
          </span>
          <span>~{tool.averageExecutionMs}ms</span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-neutral-800 group-hover:translate-x-0.5 transition-transform">
          <span>Open</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </CardFooter>
    </Card>
  );
};
