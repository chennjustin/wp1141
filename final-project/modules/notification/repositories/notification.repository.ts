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
};

