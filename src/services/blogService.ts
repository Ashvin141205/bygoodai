/**
 * ByGoodAI Frontend - Blog Service Layer
 */

import { apiClient } from './apiClient';
import { BlogPost } from '../types';
import { SEED_BLOG_POSTS } from '../db/seedData';

class BlogService {
  public async getPosts(): Promise<BlogPost[]> {
    try {
      const posts = await apiClient.get<BlogPost[]>('/blog');
      return posts;
    } catch (err) {
      console.warn('[BlogService] API error fetching blog posts, using fallback data:', err);
      return SEED_BLOG_POSTS;
    }
  }

  public async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const post = await apiClient.get<BlogPost>(`/blog/${slug}`);
      return post;
    } catch (err) {
      console.warn(`[BlogService] API error fetching post "${slug}", searching fallback data:`, err);
      return SEED_BLOG_POSTS.find((p) => p.slug === slug) || null;
    }
  }
}

export const blogService = new BlogService();
