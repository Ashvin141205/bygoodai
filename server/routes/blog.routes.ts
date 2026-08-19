/**
 * ByGoodAI Server - Blog & Technical Articles API Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { SEED_BLOG_POSTS } from '../../src/db/seedData';

export const blogRouter = Router();

/**
 * GET /api/blog
 * Retrieve published blog posts from PostgreSQL (with seed fallback)
 */
blogRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          authorName: true,
          authorRole: true,
          authorAvatar: true,
          categoryName: true,
          tags: true,
          readTimeMinutes: true,
          publishedAt: true,
        },
      });

      if (posts.length > 0) {
        return res.json({
          success: true,
          data: posts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            summary: p.excerpt,
            author: {
              name: p.authorName,
              role: p.authorRole,
              avatar: p.authorAvatar || undefined,
            },
            category: p.categoryName,
            tags: p.tags,
            publishedAt: p.publishedAt?.toISOString() || new Date().toISOString(),
            readTimeMinutes: p.readTimeMinutes,
          })),
        });
      }
    } catch {
      // Continue to seed fallback
    }

    // Return static seed posts if DB is empty or disconnected
    return res.json({
      success: true,
      data: SEED_BLOG_POSTS,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/blog/:slug
 * Retrieve specific blog post content by slug
 */
blogRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    try {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (post && post.status === 'PUBLISHED') {
        return res.json({
          success: true,
          data: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            summary: post.excerpt,
            content: post.content,
            author: {
              name: post.authorName,
              role: post.authorRole,
              avatar: post.authorAvatar || undefined,
            },
            category: post.categoryName,
            tags: post.tags,
            publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
            readTimeMinutes: post.readTimeMinutes,
          },
        });
      }
    } catch {
      // Fall through to seed lookup
    }

    // Check seed fallback
    const seedPost = SEED_BLOG_POSTS.find((p) => p.slug === slug);
    if (seedPost) {
      return res.json({
        success: true,
        data: seedPost,
      });
    }

    return res.status(404).json({
      success: false,
      error: {
        code: 'POST_NOT_FOUND',
        message: `Blog post with slug "${slug}" was not found.`,
      },
    });
  } catch (err) {
    next(err);
  }
});
