/**
 * Notification repository
 * 
 * This module encapsulates all database operations related to Notification entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

/**
 * Notification repository interface
 */
export const notificationRepository = {
  /**
   * Create a notification
   */
  async create(
    userId: string,
    type: NotificationType,
    message: string
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });
  },

  /**
   * Mark wallet invitation notifications as read for a specific wallet
   */
  async markWalletInvitationAsRead(userId: string, walletId: string) {
    // Find the wallet to get its name for message matching
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { name: true },
    });

    if (!wallet) {
      return { count: 0 };
    }

    // Mark all WALLET_INVITATION notifications as read
    // that contain the wallet name in the message
    return prisma.notification.updateMany({
      where: {
        userId,
        type: NotificationType.WALLET_INVITATION,
        isRead: false,
        isDeleted: false,
        message: {
          contains: wallet.name,
        },
      },
      data: {
        isRead: true,
      },
    });
  },

  /**
   * Mark notification as read by ID
   */
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isDeleted: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  /**
   * Find all notifications for a user
   * Returns notifications ordered by createdAt descending (newest first)
   */
  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        isDeleted: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
        isDeleted: false,
      },
    });
  },

  /**
   * Mark notification as unread by ID
   */
  async markAsUnread(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isDeleted: false,
      },
      data: {
        isRead: false,
      },
    });
  },

  /**
   * Soft delete notification by ID
   */
  async delete(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });
  },

  /**
   * Hard delete multiple notifications by IDs
   */
  async hardDeleteMany(ids: string[], userId: string) {
    if (ids.length === 0) {
      return { count: 0 };
    }
    return prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
  },

  /**
   * Find notifications related to a subscription
   * Searches for notifications that contain subscription name or tag name in the message
   */
  async findBySubscription(subscriptionId: string, userId: string) {
    // First get the subscription to extract its name and tag name
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId },
      include: {
        tag: true,
      },
    });

    if (!subscription) {
      return [];
    }

    const subscriptionName = subscription.name || subscription.tag.name;

    // Find notifications matching the subscription pattern
    return prisma.notification.findMany({
      where: {
        userId,
        type: NotificationType.SUBSCRIPTION_REMINDER,
        isDeleted: false,
        message: {
          contains: subscriptionName,
        },
      },
    });
  },

  /**
   * Delete notifications related to a subscription (hard delete)
   * Deletes notifications that match the subscription's transaction or reminder pattern
   */
  async deleteBySubscription(subscriptionId: string, userId: string) {
    const notifications = await this.findBySubscription(subscriptionId, userId);
    
    if (notifications.length === 0) {
      return { count: 0 };
    }

    const ids = notifications.map((n) => n.id);
    return this.hardDeleteMany(ids, userId);
  },
};

