/**
 * ByGoodAI Frontend - Notification Service Layer
 * Fetches notifications from PostgreSQL when authenticated, or guest notifications when in guest mode
 */

import { apiClient, ApiError } from './apiClient';
import { db } from '../db/client';
import { NotificationItem } from '../types';

class NotificationService {
  public async getNotifications(isAuthenticated = false): Promise<NotificationItem[]> {
    if (isAuthenticated) {
      try {
        const remote = await apiClient.get<any[]>('/notifications');
        if (remote && Array.isArray(remote)) {
          return remote.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: (n.type || 'info').toLowerCase() as any,
            timestamp: n.createdAt,
            isRead: n.isRead,
            actionUrl: n.actionUrl,
          }));
        }
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          // Unauthenticated
        } else {
          console.warn('[NotificationService] Failed to load remote notifications, using guest:', err);
        }
      }
    }

    return db.getNotifications();
  }

  public async markAsRead(id: string, isAuthenticated = false): Promise<void> {
    db.markNotificationAsRead(id);

    if (isAuthenticated) {
      try {
        await apiClient.patch(`/notifications/${id}/read`);
      } catch (err) {
        console.warn('[NotificationService] Remote mark-as-read sync failed:', err);
      }
    }
  }
}

export const notificationService = new NotificationService();
