/**
 * Transaction Notification Deletion Service
 * 
 * Handles deletion of notifications related to subscription transactions.
 */

import { prisma } from "@/lib/prisma";
import { NotificationType, Notification } from "@prisma/client";

/**
 * Delete transaction notifications for a subscription (hard delete)
 * Finds and permanently deletes notifications matching the subscription's transaction pattern
 */
export async function deleteTransactionNotifications(
  subscriptionId: string,
  tx?: any
): Promise<void> {
  try {
    const subscription = await (tx || prisma).subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tag: true,
        wallet: { select: { name: true } },
      },
    });

    if (!subscription) return;

    const subscriptionName = subscription.name || subscription.tag.name;
    const walletName = subscription.wallet?.name || "未知錢包";

    // Find matching transaction notifications
    const notifications = await (tx || prisma).notification.findMany({
      where: {
        userId: subscription.userId,
        type: NotificationType.SUBSCRIPTION_REMINDER,
        isDeleted: false,
        message: { contains: subscriptionName },
      },
    });

    // Filter notifications matching the transaction pattern
    const idsToDelete = notifications
      .filter(
        (n: Notification) =>
          n.message.includes(`「${subscriptionName}」`) &&
          n.message.includes(`（${walletName}）`) &&
          n.message.includes("已自動扣款")
      )
      .map((n: Notification) => n.id);

    // Hard delete all matching notifications
    if (idsToDelete.length > 0) {
      if (tx) {
        await tx.notification.deleteMany({
          where: { id: { in: idsToDelete }, userId: subscription.userId },
        });
      } else {
        await prisma.notification.deleteMany({
          where: { id: { in: idsToDelete }, userId: subscription.userId },
        });
      }
    }
  } catch (error) {
    console.error(
      `[deleteTransactionNotifications] Error deleting notifications for subscription ${subscriptionId}:`,
      error
    );
  }
}

/**
 * Delete transaction notifications for a specific date (hard delete)
 */
export async function deleteTransactionNotificationsForDate(
  subscriptionId: string,
  transactionDate: Date,
  tx?: any
): Promise<void> {
  try {
    const subscription = await (tx || prisma).subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tag: true,
        wallet: { select: { name: true } },
      },
    });

    if (!subscription) return;

    const subscriptionName = subscription.name || subscription.tag.name;
    const walletName = subscription.wallet?.name || "未知錢包";

    // Find matching transaction notifications
    const notifications = await (tx || prisma).notification.findMany({
      where: {
        userId: subscription.userId,
        type: NotificationType.SUBSCRIPTION_REMINDER,
        isDeleted: false,
        message: { contains: subscriptionName },
      },
    });

    // Filter notifications matching the transaction pattern
    const idsToDelete = notifications
      .filter(
        (n: Notification) =>
          n.message.includes(`「${subscriptionName}」`) &&
          n.message.includes(`（${walletName}）`) &&
          n.message.includes("已自動扣款")
      )
      .map((n: Notification) => n.id);

    // Hard delete all matching notifications
    if (idsToDelete.length > 0) {
      if (tx) {
        await tx.notification.deleteMany({
          where: { id: { in: idsToDelete }, userId: subscription.userId },
        });
      } else {
        await prisma.notification.deleteMany({
          where: { id: { in: idsToDelete }, userId: subscription.userId },
        });
      }
    }
  } catch (error) {
    console.error(
      `[deleteTransactionNotificationsForDate] Error deleting notifications for subscription ${subscriptionId} on date ${transactionDate.toISOString()}:`,
      error
    );
  }
}

/**
 * Delete notifications for a specific transaction
 */
export async function deleteNotificationsForTransaction(
  subscriptionId: string,
  transactionId: string,
  transactionDate: Date,
  tx?: any
): Promise<void> {
  try {
    const subscription = await (tx || prisma).subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tag: true,
        wallet: { select: { name: true } },
      },
    });

    if (!subscription) return;

    const subscriptionName = subscription.name || subscription.tag.name;
    const walletName = subscription.wallet?.name || "未知錢包";

    // Find matching transaction notifications
    const notifications = await (tx || prisma).notification.findMany({
      where: {
        userId: subscription.userId,
        type: NotificationType.SUBSCRIPTION_REMINDER,
        isDeleted: false,
        message: { contains: subscriptionName },
      },
    });

    // Filter notifications matching the transaction pattern
    const idsToDelete = notifications
      .filter(
        (n: Notification) =>
          n.message.includes(`「${subscriptionName}」`) &&
          n.message.includes(`（${walletName}）`) &&
          n.message.includes("已自動扣款")
      )
      .map((n: Notification) => n.id);

    // Hard delete all matching notifications
    if (idsToDelete.length > 0) {
      if (tx) {
        await tx.notification.deleteMany({
          where: { id: { in: idsToDelete }, userId: subscription.userId },
        });
      } else {
        await prisma.notification.deleteMany({
          where: { id: { in: idsToDelete }, userId: subscription.userId },
        });
      }
    }
  } catch (error) {
    console.error(
      `[deleteNotificationsForTransaction] Error deleting notifications for transaction ${transactionId}:`,
      error
    );
  }
}

