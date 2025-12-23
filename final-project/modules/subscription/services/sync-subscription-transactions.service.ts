/**
 * Subscription Transaction Sync Service
 * 
 * This service handles synchronization of transactions created from subscriptions.
 * When a subscription's startDate or amount changes, all related transactions
 * must be updated to maintain consistency.
 */

import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { notificationRepository } from "@/modules/notification/repositories/notification.repository";
import { sendPusherNotification } from "@/modules/notification/services/pusher-notification.service";
import { NotificationType, SubscriptionHistory, Transaction, Notification, BillingStatus } from "@prisma/client";
import type { Subscription } from "../domain/subscription.types";
import { formatAmount, calculateExpectedTransactionDates } from "../utils/subscription-utils";
import { findTransactionsBySubscription } from "./transaction-finder.service";
import {
  deleteNotificationsForTransaction,
  deleteTransactionNotificationsForDate,
  deleteTransactionNotifications,
} from "./transaction-notification-deletion.service";

/**
 * Find all transactions created by a subscription
 * Uses SubscriptionHistory to identify the relationship
 */

/**
 * Sync transaction dates when subscription startDate changes
 * 
 * Calculates the offset from the old startDate and applies it to the new startDate
 * Also deletes old notifications and creates new ones with updated date
 */
async function syncTransactionDates(
  subscriptionId: string,
  subscription: Subscription,
  oldStartDate: Date,
  newStartDate: Date,
  tx?: any
): Promise<void> {
  const transactions = await findTransactionsBySubscription(subscriptionId, tx);

  if (transactions.length === 0) {
    console.log(`[syncTransactionDates] No transactions found for subscription ${subscriptionId}`);
    return;
  }

  // Get subscription details for notification
  const fullSubscription = await (tx || prisma).subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      tag: true,
      wallet: { select: { name: true } },
    },
  });

  if (!fullSubscription) {
    console.error(`[syncTransactionDates] Subscription ${subscriptionId} not found`);
    return;
  }

  const subscriptionName = fullSubscription.name || fullSubscription.tag.name;
  const walletName = fullSubscription.wallet?.name || "未知錢包";
  const amountFormatted = formatAmount(subscription.amount, subscription.currency);

  // Normalize dates to start of day for accurate day calculation
  const oldStart = new Date(oldStartDate);
  oldStart.setHours(0, 0, 0, 0);
  const newStart = new Date(newStartDate);
  newStart.setHours(0, 0, 0, 0);

  // Calculate date offset in days
  const offsetMs = newStart.getTime() - oldStart.getTime();
  const offsetDays = Math.round(offsetMs / (1000 * 60 * 60 * 24));

  console.log(`[syncTransactionDates] Updating ${transactions.length} transactions with date offset: ${offsetDays} days`);

  // Update each transaction's date and handle notifications
  for (const transaction of transactions) {
    const oldDate = new Date(transaction.date);
    oldDate.setHours(0, 0, 0, 0);
    
    const newDate = new Date(oldDate);
    newDate.setDate(newDate.getDate() + offsetDays);
    newDate.setHours(0, 0, 0, 0);

    console.log(`[syncTransactionDates] Updating transaction ${transaction.id} date from ${oldDate.toISOString().split("T")[0]} to ${newDate.toISOString().split("T")[0]}`);

    // Delete old notifications for this transaction
    await deleteNotificationsForTransaction(subscriptionId, transaction.id, oldDate, tx);

    // Update transaction date
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

    // Create new notification with updated date
    const transactionMessage = `「${subscriptionName}」已自動扣款 ${amountFormatted}（${walletName}）`;
    
    try {
      let notification;
      if (tx) {
        notification = await tx.notification.create({
          data: {
            userId: subscription.userId,
            type: NotificationType.SUBSCRIPTION_REMINDER,
            message: transactionMessage,
          },
        });
      } else {
        notification = await notificationRepository.create(
          subscription.userId,
          NotificationType.SUBSCRIPTION_REMINDER,
          transactionMessage
        );
      }

      // Send Pusher notification
      await sendPusherNotification(
        subscription.userId,
        NotificationType.SUBSCRIPTION_REMINDER,
        transactionMessage,
        notification.id
      );
      
      console.log(`[syncTransactionDates] Created new notification for transaction ${transaction.id}`);
    } catch (error) {
      console.error(
        `[syncTransactionDates] Error creating notification for transaction ${transaction.id}:`,
        error
      );
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
          
          // Delete related SubscriptionHistory
          await tx.subscriptionHistory.deleteMany({
            where: {
              subscriptionId,
              transactionId: sorted[i].id,
            },
          });
        } else {
          await transactionRepository.softDelete(sorted[i].id);
          
          // Delete related SubscriptionHistory
          await prisma.subscriptionHistory.deleteMany({
            where: {
              subscriptionId,
              transactionId: sorted[i].id,
            },
          });
        }

        // Delete notifications for deleted transaction
        if (deletedTransaction) {
          const transactionDate = new Date(deletedTransaction.date);
          transactionDate.setHours(0, 0, 0, 0);
          await deleteNotificationsForTransaction(subscriptionId, sorted[i].id, transactionDate, tx);
        }
      }
    }
  }
}


/**
 * Sync transaction amounts when subscription amount changes
 * 
 * Updates transaction amount and related TransactionPayer/TransactionShare amounts
 * Also deletes old notifications and creates new ones with updated amount
 */
async function syncTransactionAmounts(
  subscriptionId: string,
  subscription: Subscription,
  newAmount: number,
  tx?: any
): Promise<void> {
  try {
    const transactions = await findTransactionsBySubscription(subscriptionId, tx);
    const client = tx || prisma;

    if (transactions.length === 0) {
      console.log(`[syncTransactionAmounts] No transactions found for subscription ${subscriptionId}`);
      return;
    }

    console.log(`[syncTransactionAmounts] Found ${transactions.length} transactions for subscription ${subscriptionId}, updating to amount ${newAmount}`);

    // Get subscription details for notification
    const fullSubscription = await (tx || prisma).subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tag: true,
        wallet: { select: { name: true } },
      },
    });

    if (!fullSubscription) {
      console.error(`[syncTransactionAmounts] Subscription ${subscriptionId} not found`);
      return;
    }

    const subscriptionName = fullSubscription.name || fullSubscription.tag.name;
    const walletName = fullSubscription.wallet?.name || "未知錢包";
    const newAmountFormatted = formatAmount(newAmount, subscription.currency);

    for (const transaction of transactions) {
      const oldAmount = transaction.amount;
      
      // Skip if amount is already correct
      if (Math.abs(oldAmount - newAmount) < 0.01) {
        console.log(`[syncTransactionAmounts] Transaction ${transaction.id} amount already correct (${oldAmount}), skipping`);
        continue;
      }

      console.log(`[syncTransactionAmounts] Updating transaction ${transaction.id} from ${oldAmount} to ${newAmount}`);

      // Calculate ratio for proportional updates
      const ratio = oldAmount > 0 ? newAmount / oldAmount : 1;

      // Delete old notifications for this transaction
      const transactionDate = new Date(transaction.date);
      transactionDate.setHours(0, 0, 0, 0);
      await deleteNotificationsForTransaction(subscriptionId, transaction.id, transactionDate, tx);

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

      // Create new notification with updated amount
      const transactionMessage = `「${subscriptionName}」已自動扣款 ${newAmountFormatted}（${walletName}）`;
      
      try {
        let notification;
        if (tx) {
          notification = await tx.notification.create({
            data: {
              userId: subscription.userId,
              type: NotificationType.SUBSCRIPTION_REMINDER,
              message: transactionMessage,
            },
          });
        } else {
          notification = await notificationRepository.create(
            subscription.userId,
            NotificationType.SUBSCRIPTION_REMINDER,
            transactionMessage
          );
        }

        // Send Pusher notification
        await sendPusherNotification(
          subscription.userId,
          NotificationType.SUBSCRIPTION_REMINDER,
          transactionMessage,
          notification.id
        );
        
        console.log(`[syncTransactionAmounts] Created new notification for transaction ${transaction.id}`);
      } catch (error) {
        console.error(
          `[syncTransactionAmounts] Error creating notification for transaction ${transaction.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      `[syncTransactionAmounts] Error syncing transaction amounts for subscription ${subscriptionId}:`,
      error
    );
    throw error;
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
 * Validate and clean transactions that don't match subscription rules
 * Deletes transactions that:
 * - Are before startDate
 * - Are after endDate (if exists)
 * - Don't match expected billing dates
 */
async function validateAndCleanTransactions(
  subscription: Subscription,
  tx?: any
): Promise<void> {
  try {
    const client = tx || prisma;
    const transactions = await findTransactionsBySubscription(subscription.id, tx);
    
    console.log(`[validateAndCleanTransactions] Found ${transactions.length} transactions for subscription ${subscription.id}`);
    
    if (transactions.length === 0) {
      return;
    }
    
    // Calculate expected transaction dates
    const expectedDates = calculateExpectedTransactionDates(subscription);
    const expectedDateKeys = new Set(
      expectedDates.map((d) => d.toISOString().split("T")[0])
    );
    
    console.log(`[validateAndCleanTransactions] Expected dates: ${Array.from(expectedDateKeys).join(", ")}`);
    
    const startDate = new Date(subscription.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    if (endDate) {
      endDate.setHours(0, 0, 0, 0);
    }
    
    // Find transactions to delete
    const transactionsToDelete: Array<{ id: string; date: Date }> = [];
    
    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);
      transactionDate.setHours(0, 0, 0, 0);
      const dateKey = transactionDate.toISOString().split("T")[0];
      
      // Check if transaction should be deleted
      let shouldDelete = false;
      let deleteReason = "";
      
      // Check if before startDate
      if (transactionDate < startDate) {
        shouldDelete = true;
        deleteReason = `before startDate (${startDate.toISOString().split("T")[0]})`;
      }
      
      // Check if after endDate
      if (endDate && transactionDate > endDate) {
        shouldDelete = true;
        deleteReason = `after endDate (${endDate.toISOString().split("T")[0]})`;
      }
      
      // Check if not in expected dates list
      if (!expectedDateKeys.has(dateKey)) {
        shouldDelete = true;
        deleteReason = `not in expected dates list`;
      }
      
      if (shouldDelete) {
        console.log(`[validateAndCleanTransactions] Marking transaction ${transaction.id} (date: ${dateKey}) for deletion. Reason: ${deleteReason}`);
        transactionsToDelete.push({ id: transaction.id, date: transactionDate });
      } else {
        console.log(`[validateAndCleanTransactions] Keeping transaction ${transaction.id} (date: ${dateKey})`);
      }
    }
    
    console.log(`[validateAndCleanTransactions] Will delete ${transactionsToDelete.length} transactions`);
    
    // Delete transactions and their related data
    for (const { id, date } of transactionsToDelete) {
      console.log(`[validateAndCleanTransactions] Deleting transaction ${id} (date: ${date.toISOString().split("T")[0]})`);
      
      try {
        // Soft delete transaction
        if (tx) {
          const updateResult = await tx.transaction.update({
            where: { id },
            data: { isDeleted: true },
          });
          console.log(`[validateAndCleanTransactions] Soft deleted transaction ${id}, result:`, updateResult);
          
          // Delete related SubscriptionHistory
          const deleteHistoryResult = await tx.subscriptionHistory.deleteMany({
            where: {
              subscriptionId: subscription.id,
              transactionId: id,
            },
          });
          console.log(`[validateAndCleanTransactions] Deleted ${deleteHistoryResult.count} SubscriptionHistory records for transaction ${id}`);
        } else {
          await transactionRepository.softDelete(id);
          console.log(`[validateAndCleanTransactions] Soft deleted transaction ${id} via repository`);
          
          // Delete related SubscriptionHistory
          const deleteHistoryResult = await prisma.subscriptionHistory.deleteMany({
            where: {
              subscriptionId: subscription.id,
              transactionId: id,
            },
          });
          console.log(`[validateAndCleanTransactions] Deleted ${deleteHistoryResult.count} SubscriptionHistory records for transaction ${id}`);
        }
        
        // Delete notifications for this transaction date
        // Always delete notifications for deleted transactions, not just today's
        await deleteTransactionNotificationsForDate(subscription.id, date, tx);
        console.log(`[validateAndCleanTransactions] Deleted notifications for transaction ${id}`);
      } catch (error) {
        console.error(
          `[validateAndCleanTransactions] Error deleting transaction ${id}:`,
          error
        );
        // Continue with other transactions even if one fails
      }
    }
    
    console.log(`[validateAndCleanTransactions] Completed deletion of ${transactionsToDelete.length} transactions`);
  } catch (error) {
    console.error(
      `[validateAndCleanTransactions] Error validating and cleaning transactions for subscription ${subscription.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Create missing transactions for expected dates that don't have transactions yet
 * Only creates transactions for today or past dates
 */
async function createMissingTransactions(
  subscription: Subscription,
  tx?: any
): Promise<void> {
  const client = tx || prisma;
  
  // Get subscription with full details
  const fullSubscription = await (tx || prisma).subscription.findUnique({
    where: { id: subscription.id },
    include: {
      tag: true,
      wallet: { select: { name: true } },
    },
  });
  
  if (!fullSubscription) {
    return;
  }
  
  // Calculate expected transaction dates
  const expectedDates = calculateExpectedTransactionDates(subscription);
  
  // Get existing transaction dates
  const existingTransactions = await findTransactionsBySubscription(subscription.id, tx);
  const existingDateKeys = new Set(
    existingTransactions.map((t: Transaction & { payers: any[]; shares: any[] }) => {
      const d = new Date(t.date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split("T")[0];
    })
  );
  
  // Find missing dates (expected but not existing)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const missingDates = expectedDates.filter((date) => {
    const dateKey = date.toISOString().split("T")[0];
    return !existingDateKeys.has(dateKey) && date <= today;
  });
  
  if (missingDates.length === 0) {
    return;
  }
  
  // Create transactions for missing dates
  const subscriptionName = fullSubscription.name || fullSubscription.tag.name;
  const walletName = fullSubscription.wallet?.name || "未知錢包";
  const amount = formatAmount(subscription.amount, subscription.currency);
  
  for (const transactionDate of missingDates) {
    try {
      // Create transaction
      let transaction;
      if (tx) {
        // Create transaction within transaction context
        transaction = await tx.transaction.create({
          data: {
            walletId: subscription.walletId,
            createdById: subscription.userId,
            date: transactionDate,
            amount: subscription.amount,
            currency: subscription.currency,
            name: subscriptionName,
            type: subscription.type,
            tagId: subscription.tagId,
          },
        });
        
        // Create default payer
        await tx.transactionPayer.create({
          data: {
            transactionId: transaction.id,
            payerId: subscription.userId,
            paidAmount: subscription.amount,
          },
        });
        
        // Create default share
        await tx.transactionShare.create({
          data: {
            transactionId: transaction.id,
            userId: subscription.userId,
            shareAmount: subscription.amount,
          },
        });
        
        // Create SubscriptionHistory
        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            transactionId: transaction.id,
            status: BillingStatus.SUCCESS,
            message: `Transaction created for ${transactionDate.toISOString().split("T")[0]}`,
          },
        });
      } else {
        transaction = await transactionRepository.create(subscription.userId, {
          walletId: subscription.walletId,
          date: transactionDate,
          amount: subscription.amount,
          currency: subscription.currency,
          name: subscriptionName,
          type: subscription.type,
          tagId: subscription.tagId,
        });
        
        // Create SubscriptionHistory
        await prisma.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            transactionId: transaction.id,
            status: BillingStatus.SUCCESS,
            message: `Transaction created for ${transactionDate.toISOString().split("T")[0]}`,
          },
        });
      }
      
      // Create notification
      const transactionMessage = `「${subscriptionName}」已自動扣款 ${amount}（${walletName}）`;
      
      try {
        let notification;
        if (tx) {
          notification = await tx.notification.create({
            data: {
              userId: subscription.userId,
              type: NotificationType.SUBSCRIPTION_REMINDER,
              message: transactionMessage,
            },
          });
        } else {
          notification = await notificationRepository.create(
            subscription.userId,
            NotificationType.SUBSCRIPTION_REMINDER,
            transactionMessage
          );
        }
        
        // Send Pusher notification
        await sendPusherNotification(
          subscription.userId,
          NotificationType.SUBSCRIPTION_REMINDER,
          transactionMessage,
          notification.id
        );
      } catch (error) {
        // Log error but don't fail transaction creation
        console.error(
          `[createMissingTransactions] Error creating notification for subscription ${subscription.id}:`,
          error
        );
      }
    } catch (error) {
      // Log error but continue with other dates
      console.error(
        `[createMissingTransactions] Error creating transaction for subscription ${subscription.id} on date ${transactionDate.toISOString()}:`,
        error
      );
    }
  }
}

/**
 * Main sync function
 * 
 * Synchronizes transactions when subscription changes
 * Handles:
 * - Amount changes: updates transaction amounts, deletes old notifications, creates new ones
 * - Time changes (startDate, endDate, intervalMonths): updates transaction dates, deletes old notifications, creates new ones, then validates and cleans
 */
export async function syncSubscriptionTransactions(
  subscriptionId: string,
  oldSubscription: Subscription,
  newSubscription: Subscription
): Promise<void> {
  try {
    // Normalize dates for comparison
    const oldStartDate = new Date(oldSubscription.startDate);
    oldStartDate.setHours(0, 0, 0, 0);
    const newStartDate = new Date(newSubscription.startDate);
    newStartDate.setHours(0, 0, 0, 0);
    
    const oldEndDate = oldSubscription.endDate ? new Date(oldSubscription.endDate) : null;
    if (oldEndDate) oldEndDate.setHours(0, 0, 0, 0);
    const newEndDate = newSubscription.endDate ? new Date(newSubscription.endDate) : null;
    if (newEndDate) newEndDate.setHours(0, 0, 0, 0);
    
    // Check what changed
    const startDateChanged = oldStartDate.getTime() !== newStartDate.getTime();
    const endDateChanged = 
      (oldEndDate === null && newEndDate !== null) ||
      (oldEndDate !== null && newEndDate === null) ||
      (oldEndDate !== null && newEndDate !== null && oldEndDate.getTime() !== newEndDate.getTime());
    const intervalMonthsChanged = 
      Math.abs(oldSubscription.intervalMonths - newSubscription.intervalMonths) >= 0.001;
    const amountChanged =
      Math.abs(oldSubscription.amount - newSubscription.amount) >= 0.01;
    
    const timeChanged = startDateChanged || endDateChanged || intervalMonthsChanged;

    console.log(`[syncSubscriptionTransactions] Syncing subscription ${subscriptionId}: timeChanged=${timeChanged}, amountChanged=${amountChanged}`);

    await prisma.$transaction(async (tx) => {
      // Handle time-related changes
      if (timeChanged) {
        console.log(`[syncSubscriptionTransactions] Time changed for subscription ${subscriptionId}`);
        
        // If only startDate changed (no endDate or intervalMonths change), just update existing transaction dates
        // This preserves existing transactions and only changes their dates
        if (startDateChanged && !endDateChanged && !intervalMonthsChanged) {
          console.log(`[syncSubscriptionTransactions] Only startDate changed, updating existing transaction dates`);
          await syncTransactionDates(subscriptionId, newSubscription, oldStartDate, newStartDate, tx);
        } else {
          // If endDate or intervalMonths changed, need to recalculate expected dates
          // First update dates if startDate also changed
          if (startDateChanged) {
            console.log(`[syncSubscriptionTransactions] StartDate changed along with other time fields, updating transaction dates first`);
            await syncTransactionDates(subscriptionId, newSubscription, oldStartDate, newStartDate, tx);
          }
          
          // Then validate and clean transactions that don't match new rules
          // This will delete transactions that are not in the expected dates list
          console.log(`[syncSubscriptionTransactions] Validating and cleaning transactions`);
          await validateAndCleanTransactions(newSubscription, tx);
          
          // Create missing transactions for expected dates
          console.log(`[syncSubscriptionTransactions] Creating missing transactions`);
          await createMissingTransactions(newSubscription, tx);
        }
      }
      
      // Handle amount changes: update transaction amounts, delete old notifications, create new ones
      // Always sync amounts if changed, regardless of time changes
      if (amountChanged) {
        console.log(`[syncSubscriptionTransactions] Amount changed for subscription ${subscriptionId} from ${oldSubscription.amount} to ${newSubscription.amount}`);
        await syncTransactionAmounts(subscriptionId, newSubscription, newSubscription.amount, tx);
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

