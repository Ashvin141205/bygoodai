/**
 * ByGoodAI Frontend - History Service Layer
 * Bridges local guest history with persistent PostgreSQL database history
 */

import { apiClient, ApiError } from './apiClient';
import { db } from '../db/client';

export interface HistoryItem {
  id: string;
  toolSlug: string;
  toolName?: string;
  category?: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  executionTimeMs: number;
  inputSnippet?: string;
  outputSnippet?: string;
  createdAt: string;
}

class HistoryService {
  /**
   * Retrieves execution history (from PostgreSQL API if session exists, or localStorage for guests)
   */
  public async getHistory(limit = 50, isAuthenticated = false): Promise<HistoryItem[]> {
    if (isAuthenticated) {
      try {
        const remoteHistory = await apiClient.get<HistoryItem[]>(`/history?limit=${limit}`);
        return remoteHistory;
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          // Unauthenticated session
        } else {
          console.warn('[HistoryService] Falling back to local history due to API error:', err);
        }
      }
    }

    // Guest fallback: localStorage
    const localLogs = db.getHistory().slice(0, limit);
    return localLogs.map((log) => ({
      id: log.id,
      toolSlug: log.toolSlug,
      toolName: log.toolName,
      status: (log.status?.toUpperCase() || 'SUCCESS') as any,
      executionTimeMs: log.executionTimeMs,
      inputSnippet: log.inputSnippet || (log.inputPayload ? `Payload (${log.inputPayload.length} chars)` : undefined),
      outputSnippet: log.outputSnippet || (log.outputPayload ? `Result (${log.outputPayload.length} chars)` : undefined),
      createdAt: log.timestamp,
    }));
  }

  /**
   * Records a bounded execution entry (persists to server API if authenticated, local DB for guests)
   */
  public async recordExecution(params: {
    toolSlug: string;
    toolName?: string;
    category?: string;
    status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
    executionTimeMs: number;
    inputSnippet?: string;
    outputSnippet?: string;
  }, isAuthenticated = false): Promise<void> {
    // 1. Record in guest local storage for instant access
    try {
      db.recordToolExecution(
        params.toolSlug,
        params.status,
        params.executionTimeMs,
        params.inputSnippet,
        params.outputSnippet,
        params.toolName,
        params.category
      );
    } catch {
      // Ignore local storage error
    }

    // 2. If authenticated, asynchronously sync to PostgreSQL backend
    if (isAuthenticated) {
      try {
        await apiClient.post('/history', {
          toolSlug: params.toolSlug,
          toolName: params.toolName,
          category: params.category,
          status: params.status,
          executionTimeMs: params.executionTimeMs,
          inputSnippet: params.inputSnippet ? params.inputSnippet.slice(0, 150) : undefined,
          outputSnippet: params.outputSnippet ? params.outputSnippet.slice(0, 150) : undefined,
        });
      } catch (err) {
        // Soft fail on background telemetry sync
      }
    }
  }

  /**
   * Deletes a specific history record
   */
  public async deleteHistoryItem(id: string, isAuthenticated = false): Promise<void> {
    db.deleteHistoryItem(id);
    if (isAuthenticated) {
      try {
        await apiClient.delete(`/history/${id}`);
      } catch (err) {
        console.warn('[HistoryService] Failed to delete remote history item:', err);
      }
    }
  }

  /**
   * Clears entire execution history
   */
  public async clearHistory(isAuthenticated = false): Promise<void> {
    db.clearHistory();
    if (isAuthenticated) {
      try {
        await apiClient.delete('/history');
      } catch (err) {
        console.warn('[HistoryService] Failed to clear remote history:', err);
      }
    }
  }
}

export const historyService = new HistoryService();
