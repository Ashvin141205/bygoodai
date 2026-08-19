import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowRight, Sparkles, Command, CornerDownLeft, FileCode, BookOpen, Layers, Clock, X, Terminal, Cpu } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { db } from '../../db/client';

export interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface SearchResultItem {
  type: 'tool' | 'category' | 'docs' | 'blog' | 'page';
  id: string;
  title: string;
  subtitle: string;
  path: string;
  category?: string;
  badge?: string;
  icon: React.ReactNode;
}

const RECENT_SEARCHES_KEY = 'bygoodai_recent_searches';

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = db.getTools();
  const categories = db.getCategories();
  const blogPosts = db.getBlogPosts();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    const updated = [text.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== text.trim().toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredResults = useMemo<SearchResultItem[]>(() => {
    if (!query.trim()) {
      // Default top suggestions
      const topTools = tools.slice(0, 5).map((t) => ({
        type: 'tool' as const,
        id: `tool-${t.id}`,
        title: t.name,
        subtitle: t.description,
        path: `/tools/${t.category}/${t.slug}`,
        category: t.category,
        badge: t.isPopular ? 'Popular' : undefined,
        icon: <FileCode className="h-4 w-4" />,
      }));

      const topCategories = categories.slice(0, 2).map((c) => ({
        type: 'category' as const,
        id: `cat-${c.id}`,
        title: `${c.name} Category`,
        subtitle: c.description,
        path: `/tools/${c.slug}`,
        category: c.slug,
        badge: 'Category',
        icon: <Layers className="h-4 w-4" />,
      }));

      const topDocs = [
        {
          type: 'docs' as const,
          id: 'docs-api',
          title: 'REST API & SDK Documentation',
          subtitle: 'Automate tool executions programmatically',
          path: '/docs',
          badge: 'Reference',
          icon: <Terminal className="h-4 w-4" />,
        },
      ];

      return [...topTools, ...topCategories, ...topDocs];
    }

    const q = query.toLowerCase();

    // 1. Tool matches
    const toolMatches: SearchResultItem[] = tools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (t as any).aliases?.some((a: string) => a.toLowerCase().includes(q))
      )
      .map((t) => ({
        type: 'tool',
        id: `tool-${t.id}`,
        title: t.name,
        subtitle: t.description,
        path: `/tools/${t.category}/${t.slug}`,
        category: t.category,
        badge: t.isNew ? 'New' : t.isPopular ? 'Popular' : undefined,
        icon: <FileCode className="h-4 w-4" />,
      }));

    // 2. Category matches
    const categoryMatches: SearchResultItem[] = categories
      .filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .map((c) => ({
        type: 'category',
        id: `cat-${c.id}`,
        title: `${c.name} Module`,
        subtitle: c.description,
        path: `/tools/${c.slug}`,
        category: c.slug,
        badge: 'Category',
        icon: <Layers className="h-4 w-4" />,
      }));

    // 3. Blog matches
    const blogMatches: SearchResultItem[] = blogPosts
      .filter((b) => b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q))
      .map((b) => ({
        type: 'blog',
        id: `blog-${b.id}`,
        title: b.title,
        subtitle: b.summary,
        path: `/blog/${b.slug}`,
        category: 'Blog',
        badge: 'Article',
        icon: <BookOpen className="h-4 w-4" />,
      }));

    // 4. Docs matches
    const docsMatches: SearchResultItem[] = [];
    if ('rest api endpoints authentication curl typescript sdk'.includes(q) || 'docs documentation'.includes(q)) {
      docsMatches.push({
        type: 'docs',
        id: 'docs-search',
        title: 'Platform API & SDK Reference',
        subtitle: 'cURL, TypeScript, endpoints & error formats',
        path: '/docs',
        badge: 'API Guide',
        icon: <Terminal className="h-4 w-4" />,
      });
    }

    return [...toolMatches, ...categoryMatches, ...docsMatches, ...blogMatches];
  }, [query, tools, categories, blogPosts]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex].path, query);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (path: string, searchQuery?: string) => {
    if (searchQuery) {
      saveRecentSearch(searchQuery);
    }
    onNavigate(path);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={false}>
      <div className="space-y-3 -m-2" onKeyDown={handleKeyDown}>
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-neutral-200 pb-3 px-1">
          <Search className="h-4 w-4 text-neutral-400 mr-2.5 ml-1 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, regex, JSON formatters, JWTs, docs..."
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            aria-label="Command search input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 ml-2">
            ESC
          </kbd>
        </div>

        {/* Recent Searches Pills (if available and query is empty) */}
        {!query && recentSearches.length > 0 && (
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Recent:
              </span>
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-[10px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1 py-1">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1.5">
              <p className="font-semibold text-neutral-600">No matching developer utilities found</p>
              <p className="text-[11px]">Try searching for &quot;JSON&quot;, &quot;JWT&quot;, &quot;Regex&quot;, &quot;Base64&quot;, or &quot;Hash&quot;</p>
            </div>
          ) : (
            filteredResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result.path, query)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {result.icon}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                          {result.title}
                        </span>
                        {result.badge && (
                          <Badge
                            variant={isSelected ? 'outline' : 'secondary'}
                            size="sm"
                            className={isSelected ? 'border-neutral-700 text-neutral-200' : ''}
                          >
                            {result.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        {result.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isSelected && (
                      <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-0.5">
                        <CornerDownLeft className="h-3 w-3" /> Select
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-3 px-1 text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 font-mono text-[9px]">↑</kbd>
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 font-mono text-[9px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 font-mono text-[9px]">↵</kbd>
              <span>Open</span>
            </span>
          </div>
          <span className="font-mono">{filteredResults.length} results</span>
        </div>
      </div>
    </Modal>
  );
};
