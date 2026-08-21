import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { SEOHead } from '../components/seo/SEOHead';
import { BlogCard } from '../components/ui/BlogCard';
import { Badge } from '../components/ui/Badge';
import { db } from '../db/client';
import { BookOpen } from 'lucide-react';

export interface BlogViewProps {
  onNavigate: (path: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ onNavigate }) => {
  const allPosts = db.getBlogPosts();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const tags = ['all', 'security', 'data', 'performance', 'frontend', 'developer-experience'];

  const filteredPosts = selectedTag === 'all'
    ? allPosts
    : allPosts.filter((p) => p.tags.includes(selectedTag));

  const featuredPost = allPosts[0];
  const regularPosts = allPosts.slice(1);

  return (
    <>
      <SEOHead
        title="Engineering Blog & Technical Guides"
        description="Deep dives into client-side architectures, browser cryptography primitives, and software ergonomics."
        canonicalPath="/blog"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
      />
      <PageContainer
        title="Engineering Blog & Technical Insights"
        description="Deep dives into client-side architectures, browser crypto primitives, and software ergonomics."
        breadcrumbs={[{ label: 'Blog', current: true }]}
        onNavigate={onNavigate}
      >

      <div className="space-y-8">
        {/* Header Title */}
        <div className="border-b border-neutral-200/80 pb-5 space-y-1">
          <Badge variant="indigo" size="sm" className="mb-1">Engineering Journal</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            ByGoodAI Engineering Blog
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Technical guides, architecture breakdowns, and performance benchmarks by our core developers.
          </p>
        </div>

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tag.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Featured Post Spotlight */}
        {selectedTag === 'all' && featuredPost && (
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Featured Article</span>
            <BlogCard post={featuredPost} onNavigate={onNavigate} featured />
          </div>
        )}

        {/* Blog Post Grid */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Recent Guides</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
    </>
  );
};
