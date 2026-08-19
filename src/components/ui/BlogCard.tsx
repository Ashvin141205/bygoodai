import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './Card';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types';
import { formatDate } from '../../lib/utils';

export interface BlogCardProps {
  post: BlogPost;
  onNavigate: (path: string) => void;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onNavigate, featured = false }) => {
  return (
    <Card
      hoverEffect
      onClick={() => onNavigate(`/blog/${post.slug}`)}
      className={`cursor-pointer flex flex-col justify-between group border-neutral-200/90 hover:border-neutral-400/80 ${
        featured ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      <CardHeader className="p-6 pb-3">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="indigo" size="sm">
            {post.category}
          </Badge>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readTimeMinutes} min read</span>
          </div>
        </div>

        <CardTitle className={`font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors leading-snug ${
          featured ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
        }`}>
          {post.title}
        </CardTitle>
        
        <CardDescription className="text-xs text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
          {post.summary}
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-6 pt-0 border-t border-neutral-100 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.author.name} src={post.author.avatar} size="sm" />
          <div className="truncate">
            <p className="text-xs font-semibold text-neutral-900 truncate">{post.author.name}</p>
            <p className="text-[10px] text-neutral-400">{formatDate(post.publishedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-neutral-800 group-hover:translate-x-1 transition-transform">
          <span>Read guide</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </CardFooter>
    </Card>
  );
};
