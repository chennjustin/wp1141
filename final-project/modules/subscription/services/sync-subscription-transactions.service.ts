/**
 * Subscription Transaction Sync Service
 * 
 * This service handles synchronization of transactions created from subscriptions.
 * When a subscription's startDate or amount changes, all related transactions
 * must be updated to maintain consistency.
 */

import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { NotificationType, SubscriptionHistory, Transaction, Notification } from "@prisma/client";
import type { Subscription } from "../domain/subscription.types";

/**
 * Find all transactions created by a subscription
 * Uses SubscriptionHistory to identify the relationship
 */
async function findTransactionsBySubscription(
  subscriptionId: string,
  tx?: any
) {
  const client = tx || prisma;
  
  const histories = await client.subscriptionHistory.findMany({
    where: {
      subscriptionId,
      transactionId: { not: null },
      status: "SUCCESS", // Only sync successful transactions
    },
    include: {
      transaction: {
        where: {
          isDeleted: false, // Only sync non-deleted transactions
        },
        include: {
          payers: true,
          shares: true,
        },
      },
    },
  });

  // Filter out histories where transaction is null or deleted
  return histories
    .filter((h: SubscriptionHistory & { transaction: (Transaction & { payers: any[]; shares: any[] }) | null }) => h.transaction && !h.transaction.isDeleted)
    .map((h: SubscriptionHistory & { transaction: (Transaction & { payers: any[]; shares: any[] }) | null }) => h.transaction!);
}

/**
 * Sync transaction dates when subscription startDate changes
 * 
 * Calculates the offset from the old startDate and applies it to the new startDate
 */
async function syncTransactionDates(
  subscriptionId: string,
  oldStartDate: Date,
  newStartDate: Date,
  tx?: any
): Promise<void> {
  const transactions = await findTransactionsBySubscription(subscriptionId, tx);

  if (transactions.length === 0) {
    return;
  }

  // Normalize dates to start of day for accurate day calculation
  const oldStart = new Date(oldStartDate);
  oldStart.setHours(0, 0, 0, 0);
  const newStart = new Date(newStartDate);
  newStart.setHours(0, 0, 0, 0);

  // Calculate date offset in days
  const offsetMs = newStart.getTime() - oldStart.getTime();
  const offsetDays = Math.round(offsetMs / (1000 * 60 * 60 * 24));

  // Update each transaction's date
  for (const transaction of transactions) {
    const oldDate = new Date(transaction.date);
    oldDate.setHours(0, 0, 0, 0);
    
    const newDate = new Date(oldDate);
    newDate.setDate(newDate.getDate() + offsetDays);
    newDate.setHours(0, 0, 0, 0);

    // Update transaction date
    // Use transaction client if provided, otherwise use repository
    if (tx) {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { date: newDate },
      });
    } else {
      await transactionRepository.update(transaction.id, {
        date: newDate,
      });
    }
  }

  // After updating dates, re-fetch transactions to check for duplicates
  const updatedTransactions = await findTransactionsBySubscription(subscriptionId, tx);

  // Ensure no duplicate transactions at the same date
  // Group transactions by date and keep only the most recent one
  const transactionsByDate = new Map<string, Array<{ id: string; createdAt: Date }>>();
  
  for (const transaction of updatedTransactions) {
    const dateKey = new Date(transaction.date).toISOString().split("T")[0];
    if (!transactionsByDate.has(dateKey)) {
      transactionsByDate.set(dateKey, []);
    }
    transactionsByDate.get(dateKey)!.push({
      id: transaction.id,
      createdAt: new Date(transaction.createdAt),
    });
  }

  // If multiple transactions exist for the same date, keep the most recent one
  for (const [dateKey, txs] of transactionsByDate.entries()) {
    if (txs.length > 1) {
      // Sort by createdAt descending (most recent first)
      const sorted = txs.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      // Soft delete all except the first (most recent)
      for (let i = 1; i < sorted.length; i++) {
        const deletedTransaction = updatedTransactions.find(
          (t: Transaction & { payers: any[]; shares: any[] }) => t.id === sorted[i].id
        );
        
        if (tx) {
          await tx.transaction.update({
            where: { id: sorted[i].id },
            data: { isDeleted: true },
          });
        } else {
          await transactionRepository.softDelete(sorted[i].id);
        }

        // If deleted transaction's date is today, delete related notifications
        if (deletedTransaction) {
          const transactionDate = new Date(deletedTransaction.date);
          transactionDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (transactionDate.getTime() === today.getTime()) {
            await deleteTransactionNotifications(subscriptionId, tx);
          }
        }
      }
    }
  }
}

/**
 * Delete transaction notifications for a subscription (hard delete)
 * 
 * Finds and permanently deletes notifications matching the subscription's transaction pattern
 */
async function deleteTransactionNotifications(
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
 * Sync transaction amounts when subscription amount changes
 * 
 * Updates transaction amount and related TransactionPayer/TransactionShare amounts
 */
async function syncTransactionAmounts(
  subscriptionId: string,
  newAmount: number,
  tx?: any
): Promise<void> {
  const transactions = await findTransactionsBySubscription(subscriptionId, tx);
  const client = tx || prisma;

  if (transactions.length === 0) {
    return;
  }

  for (const transaction of transactions) {
    const oldAmount = transaction.amount;
    
    // Skip if amount is already correct
    if (Math.abs(oldAmount - newAmount) < 0.01) {
      continue;
    }

    // Calculate ratio for proportional updates
    const ratio = oldAmount > 0 ? newAmount / oldAmount : 1;

    // Update transaction amount
    if (tx) {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { amount: newAmount },
      });
    } else {
      await transactionRepository.update(transaction.id, {
        amount: newAmount,
      });
    }

    // Update TransactionPayer amounts proportionally
    if (transaction.payers && transaction.payers.length > 0) {
      for (const payer of transaction.payers) {
        const newPaidAmount = Math.round(payer.paidAmount * ratio * 100) / 100;
        await client.transactionPayer.update({
          where: { id: payer.id },
          data: { paidAmount: newPaidAmount },
        });
      }
    }

    // Update TransactionShare amounts proportionally
    if (transaction.shares && transaction.shares.length > 0) {
      for (const share of transaction.shares) {
        const newShareAmount = Math.round(share.shareAmount * ratio * 100) / 100;
        await client.transactionShare.update({
          where: { id: share.id },
          data: { shareAmount: newShareAmount },
        });
      }
    }
  }
}

/**
 * Delete notifications when subscription startDate changes from today to another date
 */
async function deleteNotificationsForDateChange(
  subscriptionId: string,
  oldStartDate: Date,
  newStartDate: Date,
  tx?: any
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oldStart = new Date(oldStartDate);
  oldStart.setHours(0, 0, 0, 0);
  const newStart = new Date(newStartDate);
  newStart.setHours(0, 0, 0, 0);

  // If old startDate was today and new startDate is not today, delete today's notifications
  if (oldStart.getTime() === today.getTime() && newStart.getTime() !== today.getTime()) {
    await deleteTransactionNotifications(subscriptionId, tx);
  }
}

/**
 * Main sync function
 * 
 * Synchronizes transactions when subscription changes
 * Only syncs startDate and amount changes
 */
export async function syncSubscriptionTransactions(
  subscriptionId: string,
  oldSubscription: Subscription,
  newSubscription: Subscription
): Promise<void> {
  try {
    // Check if startDate changed
    const oldStartDate = new Date(oldSubscription.startDate);
    oldStartDate.setHours(0, 0, 0, 0);
    const newStartDate = new Date(newSubscription.startDate);
    newStartDate.setHours(0, 0, 0, 0);

    const startDateChanged =
      oldStartDate.getTime() !== newStartDate.getTime();

    // Check if amount changed
    const amountChanged =
      Math.abs(oldSubscription.amount - newSubscription.amount) >= 0.01;

    await prisma.$transaction(async (tx) => {
      if (startDateChanged) {
        await deleteNotificationsForDateChange(subscriptionId, oldStartDate, newStartDate, tx);
        await syncTransactionDates(subscriptionId, oldStartDate, newStartDate, tx);
      }
      if (amountChanged) {
        await syncTransactionAmounts(subscriptionId, newSubscription.amount, tx);
      }
    });
  } catch (error) {
    // Log error but don't fail the subscription update
    console.error(
      `[syncSubscriptionTransactions] Error syncing transactions for subscription ${subscriptionId}:`,
      error
    );
  }
}

