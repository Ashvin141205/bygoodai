import React, { useState, useMemo, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ToolCard } from '../components/tools/ToolCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { db } from '../db/client';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Search, Filter, Layers, X, Sparkles, SlidersHorizontal, ArrowUpDown, Bookmark } from 'lucide-react';

export interface ToolsDirectoryViewProps {
  initialCategory?: string;
  onNavigate: (path: string) => void;
}

export const ToolsDirectoryView: React.FC<ToolsDirectoryViewProps> = ({
  initialCategory,
  onNavigate,
}) => {
  const allTools = db.getTools();
  const categories = db.getCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'latency' | 'alpha' | 'newest'>('popular');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [bookmarkRefresh, setBookmarkRefresh] = useState(0);

  // Sync category if initialCategory prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    allTools.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [allTools]);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    return allTools
      .filter((tool) => {
        // Category filter
        if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
          return false;
        }

        // Tag filter
        if (selectedTag !== 'all' && !(tool.tags as string[]).includes(selectedTag)) {
          return false;
        }

        // Bookmark filter
        if (showBookmarksOnly && !db.isToolSaved(tool.slug)) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = tool.name.toLowerCase().includes(q);
          const matchSlug = tool.slug.toLowerCase().includes(q);
          const matchDesc = tool.description.toLowerCase().includes(q);
          const matchTags = tool.tags.some((t) => t.toLowerCase().includes(q));
          const matchAliases = (tool as any).aliases?.some((a: string) => a.toLowerCase().includes(q));
          if (!matchName && !matchSlug && !matchDesc && !matchTags && !matchAliases) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        }
        if (sortBy === 'latency') {
          return a.averageExecutionMs - b.averageExecutionMs;
        }
        if (sortBy === 'alpha') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'newest') {
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        }
        return 0;
      });
  }, [allTools, selectedCategory, selectedTag, showBookmarksOnly, searchQuery, sortBy, bookmarkRefresh]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedTag('all');
    setSearchQuery('');
    setShowBookmarksOnly(false);
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedTag !== 'all' ||
    searchQuery !== '' ||
    showBookmarksOnly;

  const currentCategoryData = categories.find((c) => c.slug === selectedCategory);

  const seoTitle = currentCategoryData
    ? `${currentCategoryData.name} Tools & Online Utilities | ByGoodAI`
    : 'Developer Tools Directory — Free Online AI & Code Utilities | ByGoodAI';

  const seoDescription = currentCategoryData
    ? `Explore fast, free, client-side ${currentCategoryData.name} utilities: ${currentCategoryData.description}`
    : 'Browse 20+ fast, client-side developer utilities, security encoders, and AI prompt engineering tools on ByGoodAI with sub-5ms speed and zero telemetry.';

  const canonicalPath = currentCategoryData
    ? `/tools/${currentCategoryData.slug}`
    : '/tools';

  const breadcrumbItems = currentCategoryData
    ? [
        { name: 'Tools', url: '/tools' },
        { name: currentCategoryData.name, url: `/tools/${currentCategoryData.slug}` },
      ]
    : [{ name: 'Tools', url: '/tools' }];

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        robots={searchQuery.trim() ? 'noindex,follow' : 'index,follow'}
        breadcrumbs={breadcrumbItems}
      />
      <PageContainer
        title={currentCategoryData ? `${currentCategoryData.name} Utilities Directory` : 'All Developer Utilities Directory'}
        description="Browse client-side formatters, analyzers, validators, and encoders."
        onNavigate={onNavigate}
      >
        <div className="space-y-8">
          {/* Visible Semantic Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

          {/* Header Title & Summary */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                {currentCategoryData ? `${currentCategoryData.name} Utilities` : 'Developer Tool Directory'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
                {currentCategoryData
                  ? currentCategoryData.description
                  : 'Explore our complete suite of client-side developer utilities designed for sub-millisecond execution.'}
              </p>
            </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showBookmarksOnly ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Bookmark className="h-3.5 w-3.5" />}
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            >
              {showBookmarksOnly ? 'Viewing Bookmarks' : 'Filter Bookmarked'}
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          {/* Top Bar: Search & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <Input
                placeholder="Search tools by name, description, or tag (e.g. JSON, regex, sha256)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                clearable
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div className="sm:col-span-4">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { label: 'Sort: Most Popular First', value: 'popular' },
                  { label: 'Sort: Fastest Latency (ms)', value: 'latency' },
                  { label: 'Sort: Alphabetical (A-Z)', value: 'alpha' },
                  { label: 'Sort: Newly Added First', value: 'newest' },
                ]}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              All Utilities ({allTools.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {cat.name} ({cat.toolCount})
              </button>
            ))}
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Tags:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                #{tag}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 ml-auto cursor-pointer"
              >
                <X className="h-3 w-3" /> Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Tools Results Grid */}
        {filteredTools.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Showing {filteredTools.length} of {allTools.length} utilities</span>
              <span>100% In-Memory Sandbox</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onNavigate={onNavigate}
                  onBookmarkChange={() => setBookmarkRefresh((prev) => prev + 1)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No matching developer tools found"
            description="We couldn't find any utilities matching your current filter criteria or search query."
            actionLabel="Reset Filters"
            onAction={handleClearFilters}
          />
        )}
      </div>
    </PageContainer>
    </>
  );
};
