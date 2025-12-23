/**
 * Notification service
 * 
 * This service handles business logic related to notifications.
 * It provides a clean interface for notification operations.
 */

import { notificationRepository } from "../repositories/notification.repository";
import { NotificationType } from "@prisma/client";
import type { Notification } from "@prisma/client";

/**
 * Service result type
 */
export interface NotificationServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Notification service interface
 */
export const notificationService = {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string): Promise<NotificationServiceResult<Notification[]>> {
    try {
      const notifications = await notificationRepository.findByUserId(userId);
      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error("Error getting user notifications:", error);
      return {
        success: false,
        error: "Failed to get notifications",
      };
    }
  },

  /**
   * Mark a single notification as read
   */
  async markNotificationAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationServiceResult<void>> {
    try {
      const result = await notificationRepository.markAsRead(notificationId, userId);
      
      if (result.count === 0) {
        return {
          success: false,
          error: "Notification not found or already read",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        error: "Failed to mark notification as read",
      };
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string): Promise<NotificationServiceResult<void>> {
    try {
      await notificationRepository.markAllAsRead(userId);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error: "Failed to mark all notifications as read",
      };
    }
  },

  /**
   * Get unread notification count for a user
   */
  async getUnreadNotificationCount(userId: string): Promise<NotificationServiceResult<number>> {
    try {
      const count = await notificationRepository.getUnreadCount(userId);
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return {
        success: false,
        error: "Failed to get unread notification count",
      };
    }
  },

  /**
   * Create a notification for a user
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string
  ): Promise<NotificationServiceResult<Notification>> {
    try {
      // Validate message
      if (!message || message.trim().length === 0) {
        return {
          success: false,
          error: "Message is required",
        };
      }

      const notification = await notificationRepository.create(
        userId,
        type,
        message.trim()
      );

      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      return {
        success: false,
        error: "Failed to create notification",
      };
    }
  },

  /**
   * Mark a notification as unread
   */
  async markNotificationAsUnread(
    notificationId: string,
    userId: string
  ): Promise<NotificationServiceResult<void>> {
    try {
      const result = await notificationRepository.markAsUnread(notificationId, userId);
      
      if (result.count === 0) {
        return {
          success: false,
          error: "Notification not found or already deleted",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      return {
        success: false,
        error: "Failed to mark notification as unread",
      };
    }
  },

  /**
   * Delete a notification (soft delete)
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<NotificationServiceResult<void>> {
    try {
      const result = await notificationRepository.delete(notificationId, userId);
      
      if (result.count === 0) {
        return {
          success: false,
          error: "Notification not found or already deleted",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        error: "Failed to delete notification",
      };
    }
  },
};

