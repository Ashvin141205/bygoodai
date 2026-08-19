/**
 * ByGoodAI Frontend - Saved Tools / Bookmarks Service Layer
 * Bridges local guest saved tools with persistent PostgreSQL database bookmarks
 */

import { apiClient, ApiError } from './apiClient';
import { db } from '../db/client';

export interface SavedToolItem {
  id: string;
  toolSlug: string;
  toolName?: string;
  createdAt: string;
}

class SavedToolService {
  /**
   * Retrieves user bookmarks (from API if authenticated, else localStorage)
   */
  public async getSavedTools(isAuthenticated = false): Promise<SavedToolItem[]> {
    if (isAuthenticated) {
      try {
        const remoteSaved = await apiClient.get<SavedToolItem[]>('/saved-tools');
        return remoteSaved;
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          // Unauthenticated session
        } else {
          console.warn('[SavedToolService] API fetch failed, falling back to local storage:', err);
        }
      }
    }

    const localSaved = db.getSavedItems();
    return localSaved.map((item) => ({
      id: item.id,
      toolSlug: item.toolSlug,
      toolName: item.title,
      createdAt: item.savedAt,
    }));
  }

  /**
   * Checks if a tool is saved
   */
  public isToolSaved(toolSlug: string, cachedSavedList?: SavedToolItem[]): boolean {
    if (cachedSavedList) {
      return cachedSavedList.some((s) => s.toolSlug === toolSlug);
    }
    return db.isToolSaved(toolSlug);
  }

  /**
   * Toggles bookmark state for a tool
   */
  public async toggleSave(toolId: string, toolSlug: string, toolName: string, isAuthenticated = false): Promise<boolean> {
    const isCurrentlySaved = db.isToolSaved(toolSlug);

    // Update local storage first for instantaneous UI response
    const localNewState = db.toggleSaveItem(toolId, toolSlug, toolName);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        if (isCurrentlySaved) {
          await apiClient.delete(`/saved-tools/${toolSlug}`);
        } else {
          await apiClient.post('/saved-tools', { toolSlug, toolName });
        }
      } catch (err) {
        console.warn('[SavedToolService] Failed to sync saved tool state to backend:', err);
      }
    }

    return localNewState;
  }
}

export const savedToolService = new SavedToolService();
