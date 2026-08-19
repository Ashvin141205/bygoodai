/**
 * ByGoodAI Frontend - Static Public Catalog & Guest Local Storage Provider
 * 
 * RESPONSIBILITY SEPARATION:
 * 1. Static Catalog: Provides immutable metadata for tool items, categories, and offline seed articles.
 * 2. Guest Local Storage: Manages client-only temporary history and bookmarks for unauthenticated guest users.
 * 
 * NOTE: Authenticated persistence is strictly handled server-side by PostgreSQL via /api routes.
 * This client does NOT act as server database persistence.
 */

import { ToolCategory, ToolItem, BlogPost, ToolHistoryItem, SavedItem, NotificationItem, SystemMetrics } from '../types';
import { SEED_CATEGORIES, SEED_TOOLS, SEED_BLOG_POSTS } from './seedData';
import { logger } from '../lib/logger';

class GuestDatabaseClient {
  private categories: ToolCategory[] = [...SEED_CATEGORIES];
  private tools: ToolItem[] = [...SEED_TOOLS];
  private blogPosts: BlogPost[] = [...SEED_BLOG_POSTS];
  private histories: ToolHistoryItem[] = [];
  private savedItems: SavedItem[] = [];
  private notifications: NotificationItem[] = [
    {
      id: 'notif-welcome',
      title: 'Welcome to ByGoodAI Platform',
      message: 'Explore over 10+ developer tools with sub-5ms client execution.',
      type: 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
      actionUrl: '/tools',
    },
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedHist = localStorage.getItem('bygoodai_guest_history') || localStorage.getItem('bygoodai_history');
      if (savedHist) this.histories = JSON.parse(savedHist);

      const savedBookmarks = localStorage.getItem('bygoodai_guest_saved') || localStorage.getItem('bygoodai_saved');
      if (savedBookmarks) this.savedItems = JSON.parse(savedBookmarks);
    } catch (err) {
      logger.warn('Could not read guest data from localStorage', { error: err });
    }
  }

  private persistStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bygoodai_guest_history', JSON.stringify(this.histories.slice(0, 100)));
      localStorage.setItem('bygoodai_guest_saved', JSON.stringify(this.savedItems));
    } catch (err) {
      logger.warn('Could not persist guest data to localStorage', { error: err });
    }
  }

  // Static Tool Catalog
  public getCategories(): ToolCategory[] {
    return this.categories;
  }

  public getCategoryBySlug(slug: string): ToolCategory | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  public getTools(): ToolItem[] {
    return this.tools;
  }

  public getToolBySlug(slug: string): ToolItem | undefined {
    return this.tools.find((t) => t.slug === slug);
  }

  public getToolsByCategory(categorySlug: string): ToolItem[] {
    return this.tools.filter((t) => t.category === categorySlug);
  }

  public getPopularTools(): ToolItem[] {
    return this.tools.filter((t) => t.isPopular);
  }

  // Guest Local History Management
  public recordToolExecution(
    toolSlugOrId: string,
    statusOrMs: 'SUCCESS' | 'FAILURE' | string | number,
    executionMsOrSuccess?: number | boolean,
    inputSnippet?: string,
    outputSnippet?: string,
    toolName?: string,
    category?: string,
    _optionsUsed?: Record<string, any>
  ) {
    let slug = toolSlugOrId;
    let isSuccess = true;
    let durationMs = 0;

    if (typeof statusOrMs === 'number') {
      durationMs = statusOrMs;
      isSuccess = Boolean(executionMsOrSuccess);
    } else {
      isSuccess = statusOrMs === 'SUCCESS';
      durationMs = typeof executionMsOrSuccess === 'number' ? executionMsOrSuccess : 0;
    }

    const tool = this.tools.find((t) => t.slug === slug || t.id === slug);
    if (tool) {
      tool.usageCount += 1;
      slug = tool.slug;
    }

    const historyItem: ToolHistoryItem = {
      id: 'guest_hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      toolId: tool?.id || slug,
      toolSlug: slug,
      toolName: toolName || tool?.name || slug,
      category: category || tool?.category || 'developer',
      inputSnippet: (inputSnippet || '').slice(0, 150),
      outputSnippet: (outputSnippet || '').slice(0, 150),
      inputPayload: inputSnippet,
      outputPayload: outputSnippet,
      status: isSuccess ? 'SUCCESS' : 'ERROR',
      timestamp: new Date().toISOString(),
      executionTimeMs: durationMs,
      isSuccess,
    };

    this.histories.unshift(historyItem);
    if (this.histories.length > 200) this.histories.pop();
    this.persistStorage();

    logger.info(`[GuestStore] Recorded execution for tool: ${slug}`, { durationMs });
    return historyItem;
  }

  public addHistoryItem(item: {
    toolSlug: string;
    toolName: string;
    inputPayload?: string;
    outputPayload?: string;
    status?: 'SUCCESS' | 'ERROR' | string;
    executionTimeMs: number;
  }): ToolHistoryItem {
    const tool = this.tools.find((t) => t.slug === item.toolSlug);
    if (tool) {
      tool.usageCount += 1;
    }

    const historyItem: ToolHistoryItem = {
      id: 'guest_hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      toolId: tool?.id || item.toolSlug,
      toolSlug: item.toolSlug,
      toolName: item.toolName || tool?.name || item.toolSlug,
      category: tool?.category || 'utility',
      inputSnippet: (item.inputPayload || '').slice(0, 150),
      outputSnippet: (item.outputPayload || '').slice(0, 150),
      inputPayload: item.inputPayload,
      outputPayload: item.outputPayload,
      status: item.status || 'SUCCESS',
      timestamp: new Date().toISOString(),
      executionTimeMs: item.executionTimeMs,
      isSuccess: item.status !== 'ERROR',
    };

    this.histories.unshift(historyItem);
    if (this.histories.length > 200) this.histories.pop();
    this.persistStorage();

    return historyItem;
  }

  public getHistory(): ToolHistoryItem[] {
    return this.histories;
  }

  public clearHistory() {
    this.histories = [];
    this.persistStorage();
  }

  public deleteHistoryItem(id: string) {
    this.histories = this.histories.filter((h) => h.id !== id);
    this.persistStorage();
  }

  // Guest Saved / Bookmarks
  public getSavedItems(): SavedItem[] {
    return this.savedItems;
  }

  public toggleSaveItem(toolId: string, toolSlug: string, title: string) {
    const existing = this.savedItems.find((s) => s.toolSlug === toolSlug);
    if (existing) {
      this.savedItems = this.savedItems.filter((s) => s.toolSlug !== toolSlug);
    } else {
      this.savedItems.push({
        id: 'guest_save_' + Date.now(),
        toolId,
        toolSlug,
        title,
        savedAt: new Date().toISOString(),
      });
    }
    this.persistStorage();
    return !existing;
  }

  public isToolSaved(toolSlug: string): boolean {
    return this.savedItems.some((s) => s.toolSlug === toolSlug);
  }

  // Static Blog Catalog
  public getBlogPosts(): BlogPost[] {
    return this.blogPosts;
  }

  public getBlogPostBySlug(slug: string): BlogPost | undefined {
    return this.blogPosts.find((p) => p.slug === slug);
  }

  // Guest Notifications
  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
  }

  // System Metrics (Public overview)
  public getSystemMetrics(): SystemMetrics {
    const totalExecs = this.tools.reduce((sum, t) => sum + t.usageCount, 0) + this.histories.length;
    return {
      totalTools: this.tools.length,
      totalCategories: this.categories.length,
      totalExecutions: totalExecs,
      averageLatencyMs: 4.8,
      uptimePercentage: 99.98,
      activeUsers24h: 3420,
      serverVersion: '2.4.0-prod',
    };
  }
}

export const db = new GuestDatabaseClient();
