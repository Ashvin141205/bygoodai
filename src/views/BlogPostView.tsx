import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { SEOHead } from '../components/seo/SEOHead';
import { createArticleSchema } from '../lib/seo';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { db } from '../db/client';
import { formatDate } from '../lib/utils';
import { Clock, ArrowLeft, Share2, Bookmark, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { copyToClipboard } from '../lib/utils';

export interface BlogPostViewProps {
  postSlug?: string;
  slug?: string;
  onNavigate: (path: string) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ postSlug, slug, onNavigate }) => {
  const { showToast } = useToast();
  const effectiveSlug = postSlug || slug || '';
  const post = db.getBlogPostBySlug(effectiveSlug);

  if (!post) {
    return (
      <>
        <SEOHead
          title="Article Not Found | ByGoodAI"
          description="The requested blog article could not be found."
          robots="noindex,nofollow"
          isPrivate={true}
        />
        <PageContainer
          title="Article Not Found"
          description="The requested blog post could not be found."
          onNavigate={onNavigate}
        >
          <div className="text-center py-16 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Article Not Found</h2>
            <Button variant="primary" onClick={() => onNavigate('/blog')}>
              Return to Blog Index
            </Button>
          </div>
        </PageContainer>
      </>
    );
  }

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Article link copied to clipboard', 'success');
    }
  };

  return (
    <>
      <SEOHead
        title={`${post.title} — ByGoodAI Engineering`}
        description={post.summary}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        publishedTime={post.publishedAt}
        authorName={post.author.name}
        tags={post.tags}
        jsonLd={createArticleSchema(post)}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <PageContainer
        title={`${post.title} — ByGoodAI Engineering`}
        description={post.summary}
        breadcrumbs={[
          { label: 'Blog', onClick: () => onNavigate('/blog') },
          { label: post.category, onClick: () => onNavigate('/blog') },
          { label: post.title, current: true },
        ]}
        onNavigate={onNavigate}
      >

      <article className="max-w-3xl mx-auto space-y-8">
        {/* Top Back Navigation */}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => onNavigate('/blog')}
          className="text-xs"
        >
          Back to all articles
        </Button>

        {/* Header Metadata */}
        <div className="space-y-4 border-b border-neutral-200/80 pb-6">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm">{post.category}</Badge>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readTimeMinutes} min read</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            {post.summary}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Avatar name={post.author.name} src={post.author.avatar} size="md" />
              <div>
                <p className="text-xs font-bold text-neutral-900">{post.author.name}</p>
                <p className="text-[11px] text-neutral-400">Published on {formatDate(post.publishedAt)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="h-3.5 w-3.5" />}
              onClick={handleShare}
            >
              Share
            </Button>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="space-y-6 text-sm text-neutral-700 leading-relaxed font-sans">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-600">
            <strong>TL;DR:</strong> Client-side in-memory execution guarantees zero data ingestion, sub-5ms latency, and eliminates third-party telemetry vulnerabilities.
          </div>

          <p>
            When engineers format secret API payloads, inspect JSON Web Tokens (JWTs) containing user identifiers, or generate cryptographic checksums, data safety is paramount. Standard online formatters often route these sensitive payloads through remote proxy layers where access logs and analytics trackers can intercept them.
          </p>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">The In-Memory Isolation Strategy</h2>
          <p>
            ByGoodAI leverages modern browser capabilities—specifically the W3C Web Cryptography API and V8 JavaScript isolates—to process data completely in-memory. Because computations never generate remote network requests, security guarantees are absolute and execution speeds remain practically instantaneous.
          </p>

          <div className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-emerald-300">
            // Client-side Web Crypto example{'\n'}
            const hashBuffer = await crypto.subtle.digest(&apos;SHA-256&apos;, new TextEncoder().encode(payload));
          </div>

          <h2 className="text-lg font-bold text-neutral-900 pt-4">Zero-Telemetry Benchmarks</h2>
          <p>
            In our performance benchmarks across standard payloads ranging from 1KB to 2MB, in-memory execution outperformed cloud-routed endpoints by an average factor of 40x in wall-clock latency while maintaining 100% data confidentiality.
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 pt-6 border-t border-neutral-200">
          <span className="text-xs font-bold text-neutral-500">Tags:</span>
          {post.tags.map((t) => (
            <span key={t} className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 font-mono">
              #{t}
            </span>
          ))}
        </div>
      </article>
    </PageContainer>
    </>
  );
};
