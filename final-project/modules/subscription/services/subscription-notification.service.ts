/**
 * Subscription Notification Service
 * 
 * This service handles all notification-related operations for subscriptions.
 * It encapsulates the logic for creating, updating, and deleting subscription notifications.
 */

import { prisma } from "@/lib/prisma";
import { notificationService } from "@/modules/notification/services/notification.service";
import { NotificationType } from "@prisma/client";
import type { Subscription } from "../domain/subscription.types";
import { formatDate, formatAmount, isBillingInTwoDays } from "../utils/subscription-utils";

/**
 * Create a transaction notification for a subscription
 * Format: 系統已幫您建立「{訂閱名稱}{金額}」的款項了！！ ({錢包名稱})
 */
export async function createTransactionNotification(
  subscription: Subscription,
  walletName?: string
): Promise<void> {
  try {
    // Get wallet name if not provided
    let finalWalletName = walletName;
    if (!finalWalletName) {
      const wallet = await prisma.wallet.findUnique({
        where: { id: subscription.walletId },
        select: { name: true },
      });
      finalWalletName = wallet?.name || "未知錢包";
    }

    const subscriptionName = subscription.name || subscription.tag.name;
    const amount = formatAmount(subscription.amount, subscription.currency);
    const message = `系統已幫您建立「${subscriptionName}${amount}」的款項了！ (${finalWalletName})`;

    await notificationService.createSubscriptionNotification(
      subscription.userId,
      NotificationType.SUBSCRIPTION_REMINDER,
      message
    );
  } catch (error) {
    console.error(
      `[createTransactionNotification] Error creating transaction notification for subscription ${subscription.id}:`,
      error
    );
    // Don't throw - notification failure shouldn't break the operation
  }
}

/**
 * Create a batch transaction notification for multiple transactions
 * Format: 幫你補齊從{開始日期}到{結束日期}的款項了！！
 */
export async function createBatchTransactionNotification(
  subscription: Subscription,
  startDate: Date,
  endDate: Date,
  walletName?: string
): Promise<void> {
  try {
    // Get wallet name if not provided
    let finalWalletName = walletName;
    if (!finalWalletName) {
      const wallet = await prisma.wallet.findUnique({
        where: { id: subscription.walletId },
        select: { name: true },
      });
      finalWalletName = wallet?.name || "未知錢包";
    }

    const subscriptionName = subscription.name || subscription.tag.name;
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const message = `「${subscriptionName}」幫你補齊從${startDateStr}到${endDateStr}的款項了！！`;

    await notificationService.createSubscriptionNotification(
      subscription.userId,
      NotificationType.SUBSCRIPTION_REMINDER,
      message
    );
  } catch (error) {
    console.error(
      `[createBatchTransactionNotification] Error creating batch transaction notification for subscription ${subscription.id}:`,
      error
    );
    // Don't throw - notification failure shouldn't break the operation
  }
}

/**
 * Create a reminder notification for a subscription
 * Format: 「{訂閱名稱}」將於後天（{日期}）自動扣款 {金額}（{錢包名稱}）
 */
export async function createReminderNotification(
  subscription: Subscription,
  walletName?: string
): Promise<void> {
  try {
    // Check if reminder should be created
    if (!isBillingInTwoDays(subscription)) {
      return;
    }

    // Check if reminder notification already exists
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId: subscription.userId,
        type: NotificationType.SUBSCRIPTION_REMINDER,
        isRead: false,
        isDeleted: false,
        message: {
          contains: subscription.name || subscription.tag.name,
        },
      },
    });

    // If reminder already exists, skip creating a new one
    if (existingReminder) {
      return;
    }

    // Get wallet name if not provided
    let finalWalletName = walletName;
    if (!finalWalletName) {
      const wallet = await prisma.wallet.findUnique({
        where: { id: subscription.walletId },
        select: { name: true },
      });
      finalWalletName = wallet?.name || "未知錢包";
    }

    const subscriptionName = subscription.name || subscription.tag.name;
    const billingDate = formatDate(new Date(subscription.nextBilling));
    const amount = formatAmount(subscription.amount, subscription.currency);
    const message = `「${subscriptionName}」將於後天（${billingDate}）自動扣款 ${amount}（${finalWalletName}）`;

    await notificationService.createSubscriptionNotification(
      subscription.userId,
      NotificationType.SUBSCRIPTION_REMINDER,
      message
    );
  } catch (error) {
    console.error(
      `[createReminderNotification] Error creating reminder notification for subscription ${subscription.id}:`,
      error
    );
    // Don't throw - notification failure shouldn't break the operation
  }
}

/**
 * Delete all notifications related to a subscription
 */
export async function deleteSubscriptionNotifications(
  subscriptionId: string,
  userId: string
): Promise<void> {
  try {
    await notificationService.deleteSubscriptionNotifications(
      subscriptionId,
      userId
    );
  } catch (error) {
    console.error(
      `[deleteSubscriptionNotifications] Error deleting notifications for subscription ${subscriptionId}:`,
      error
    );
    // Don't throw - notification deletion failure shouldn't break the operation
  }
}

/**
 * Update reminder notification when subscription's nextBilling changes
 * Deletes old reminder and creates new one if needed
 */
export async function updateReminderNotification(
  subscription: Subscription,
  oldNextBilling: Date,
  walletName?: string
): Promise<void> {
  try {
    const oldNextBillingDate = new Date(oldNextBilling);
    oldNextBillingDate.setHours(0, 0, 0, 0);
    
    const newNextBillingDate = new Date(subscription.nextBilling);
    newNextBillingDate.setHours(0, 0, 0, 0);

    // If nextBilling didn't change, no need to update
    if (oldNextBillingDate.getTime() === newNextBillingDate.getTime()) {
      return;
    }

    // Delete old reminder notifications
    const subscriptionName = subscription.name || subscription.tag.name;
    const oldReminders = await prisma.notification.findMany({
      where: {
        userId: subscription.userId,
        type: NotificationType.SUBSCRIPTION_REMINDER,
        isDeleted: false,
        message: {
          contains: subscriptionName,
        },
      },
    });

    // Filter reminders that match the old billing date pattern
    const oldBillingDateStr = formatDate(oldNextBillingDate);
    const oldReminderIds = oldReminders
      .filter((n) => n.message.includes(`後天（${oldBillingDateStr}）`))
      .map((n) => n.id);

    if (oldReminderIds.length > 0) {
      await notificationService.hardDeleteNotifications(
        oldReminderIds,
        subscription.userId
      );
    }

    // Create new reminder if needed
    await createReminderNotification(subscription, walletName);
  } catch (error) {
    console.error(
      `[updateReminderNotification] Error updating reminder notification for subscription ${subscription.id}:`,
      error
    );
    // Don't throw - notification failure shouldn't break the operation
  }
}

