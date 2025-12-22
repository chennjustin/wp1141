/**
 * Add Transaction Service
 * 
 * This service handles automatic transaction creation from subscriptions.
 * It checks for subscriptions that are due and creates transactions accordingly.
 */

import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { notificationRepository } from "@/modules/notification/repositories/notification.repository";
import { sendPusherNotification } from "@/modules/notification/services/pusher-notification.service";
import { NotificationType } from "@prisma/client";
import type { Subscription } from "../domain/subscription.types";

/**
 * Calculate the next billing date based on intervalMonths
 */
function calculateNextBilling(currentBilling: Date, intervalMonths: number): Date {
  const next = new Date(currentBilling);
  
  // Handle different interval types
  if (Math.abs(intervalMonths - 0.033) < 0.001) {
    // Daily: add 1 day
    next.setDate(next.getDate() + 1);
  } else if (Math.abs(intervalMonths - 0.25) < 0.001) {
    // Weekly: add 7 days
    next.setDate(next.getDate() + 7);
  } else if (Math.abs(intervalMonths - 1) < 0.001) {
    // Monthly: add 1 month
    next.setMonth(next.getMonth() + 1);
  } else if (Math.abs(intervalMonths - 12) < 0.001) {
    // Yearly: add 1 year
    next.setFullYear(next.getFullYear() + 1);
  } else {
    // Custom: add the specified number of months
    // intervalMonths is stored as Float, so we can use it directly
    const monthsToAdd = Math.floor(intervalMonths);
    const daysToAdd = Math.round((intervalMonths - monthsToAdd) * 30);
    next.setMonth(next.getMonth() + monthsToAdd);
    if (daysToAdd > 0) {
      next.setDate(next.getDate() + daysToAdd);
    }
  }
  
  return next;
}

/**
 * Check if subscription should create a transaction today
 */
function shouldCreateTransaction(subscription: Subscription): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextBilling = new Date(subscription.nextBilling);
  nextBilling.setHours(0, 0, 0, 0);
  
  // Check if nextBilling is today or in the past
  if (nextBilling > today) {
    return false;
  }
  
  // Check if subscription has expired
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (today > endDate) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if subscription billing is in two days (for reminder notification)
 */
function isBillingInTwoDays(subscription: Subscription): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  
  const nextBilling = new Date(subscription.nextBilling);
  nextBilling.setHours(0, 0, 0, 0);
  
  // Check if nextBilling is in two days
  return (
    nextBilling.getTime() === twoDaysLater.getTime() &&
    (!subscription.endDate || nextBilling <= new Date(subscription.endDate))
  );
}

/**
 * Format date for display (YYYY/MM/DD)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * Format amount for display
 */
function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${currency} ${rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Create subscription reminder notification if needed
 */
async function createSubscriptionReminderIfNeeded(subscription: Subscription) {
  if (!isBillingInTwoDays(subscription)) {
    return;
  }

  try {
    // Check if reminder notification already exists for this subscription
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

    // Create reminder notification
    // Format: "「訂閱名稱」將於後天（YYYY/MM/DD）自動扣款 金額（錢包名稱）"
    // We need to get wallet name from the subscription
    const wallet = await prisma.wallet.findUnique({
      where: { id: subscription.walletId },
      select: { name: true },
    });
    const subscriptionName = subscription.name || subscription.tag.name;
    const walletName = wallet?.name || "未知錢包";
    const billingDate = formatDate(new Date(subscription.nextBilling));
    const amount = formatAmount(subscription.amount, subscription.currency);
    const message = `「${subscriptionName}」將於後天（${billingDate}）自動扣款 ${amount}（${walletName}）`;

    const notification = await notificationRepository.create(
      subscription.userId,
      NotificationType.SUBSCRIPTION_REMINDER,
      message
    );

    // Send Pusher notification
    await sendPusherNotification(
      subscription.userId,
      NotificationType.SUBSCRIPTION_REMINDER,
      message,
      notification.id
    );
  } catch (error) {
    // Log error but don't fail the entire process
    console.error(
      `Error creating subscription reminder for subscription ${subscription.id}:`,
      error
    );
  }
}

/**
 * Process subscriptions and create transactions for those that are due
 */
export async function addTransactionFromSubscriptions() {
  const results = {
    processed: 0,
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Get all active subscriptions
    // We need to get subscriptions without userId filter to process all
    const subscriptions = await prisma.subscription.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        tag: true,
        wallet: {
          select: {
            id: true,
            name: true,
            members: {
              where: {
                isDeleted: false,
              },
              select: {
                userId: true,
              },
            },
          },
        },
      },
    } as any);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const subscription of subscriptions) {
      results.processed++;

      try {
        // Type assertion to access all fields
        const sub = subscription as any;
        
        // Check if subscription should create a transaction
        const subscriptionTyped: Subscription = {
          id: sub.id,
          walletId: sub.walletId,
          userId: sub.userId,
          amount: sub.amount,
          currency: sub.currency,
          nextBilling: new Date(sub.nextBilling),
          intervalMonths: sub.intervalMonths,
          startDate: new Date(sub.startDate),
          endDate: sub.endDate ? new Date(sub.endDate) : null,
          type: sub.type,
          tagId: sub.tagId,
          name: sub.name,
          tag: {
            id: sub.tag.id,
            name: sub.tag.name,
            iconKey: sub.tag.iconKey,
          },
          isDeleted: sub.isDeleted,
          createdAt: new Date(sub.createdAt),
          updatedAt: new Date(sub.updatedAt),
        };

        // Check if billing is tomorrow and create reminder notification
        await createSubscriptionReminderIfNeeded(subscriptionTyped);

        if (!shouldCreateTransaction(subscriptionTyped)) {
          results.skipped++;
          continue;
        }

        // Get the subscription owner (userId)
        const userId = sub.userId;
        if (!userId) {
          results.errors.push(`Subscription ${sub.id} has no userId`);
          results.skipped++;
          continue;
        }

        // Create transaction
        const transactionDate = new Date(sub.nextBilling);
        transactionDate.setHours(0, 0, 0, 0);

        await transactionRepository.create(userId, {
          walletId: sub.walletId,
          date: transactionDate,
          amount: sub.amount,
          currency: sub.currency,
          name: sub.name || sub.tag.name,
          type: sub.type,
          tagId: sub.tagId,
        });

        // Create notification for successful transaction creation
        const subscriptionName = sub.name || sub.tag.name;
        const walletName = sub.wallet?.name || "未知錢包";
        const amount = formatAmount(sub.amount, sub.currency);
        const transactionMessage = `「${subscriptionName}」已自動扣款 ${amount}（${walletName}）`;

        try {
          const notification = await notificationRepository.create(
            userId,
            NotificationType.SUBSCRIPTION_REMINDER,
            transactionMessage
          );

          // Send Pusher notification
          await sendPusherNotification(
            userId,
            NotificationType.SUBSCRIPTION_REMINDER,
            transactionMessage,
            notification.id
          );
        } catch (error) {
          // Log error but don't fail the transaction creation
          console.error(
            `Error creating transaction notification for subscription ${sub.id}:`,
            error
          );
        }

        // Calculate next billing date
        const nextBilling = calculateNextBilling(
          new Date(sub.nextBilling),
          sub.intervalMonths
        );

        // Check if next billing exceeds endDate
        let finalNextBilling = nextBilling;
        if (sub.endDate) {
          const endDate = new Date(sub.endDate);
          if (nextBilling > endDate) {
            // Don't update nextBilling if it exceeds endDate
            // The subscription will naturally expire
            results.created++;
            continue;
          }
        }

        // Update subscription's nextBilling
        await subscriptionRepository.update(sub.id, {
          nextBilling: finalNextBilling,
        });

        results.created++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Subscription ${subscription.id}: ${errorMessage}`);
        console.error(`Error processing subscription ${subscription.id}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("[addTransactionFromSubscriptions] Unexpected error:", error);
    throw error;
  }
}

