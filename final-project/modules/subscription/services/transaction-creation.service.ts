/**
 * Transaction Creation Service
 * 
 * Creates missing transactions for expected dates that don't have transactions yet.
 * Only creates transactions for today or past dates.
 */

import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { notificationRepository } from "@/modules/notification/repositories/notification.repository";
import { sendPusherNotification } from "@/modules/notification/services/pusher-notification.service";
import { NotificationType, BillingStatus, Transaction } from "@prisma/client";
import type { Subscription } from "../domain/subscription.types";
import { calculateExpectedTransactionDates, formatAmount } from "../utils/subscription-utils";
import { findTransactionsBySubscription } from "./transaction-finder.service";
import { createBatchTransactionNotification } from "./subscription-notification.service";

/**
 * Create missing transactions for expected dates that don't have transactions yet
 * Only creates transactions for today or past dates
 */
export async function createMissingTransactions(
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
  
  let firstTransactionDate: Date | null = null;
  let lastTransactionDate: Date | null = null;
  let transactionCount = 0;
  
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
      
      // Track first and last transaction dates
      if (!firstTransactionDate) {
        firstTransactionDate = transactionDate;
      }
      lastTransactionDate = transactionDate;
      transactionCount++;
    } catch (error) {
      // Log error but continue with other dates
      console.error(
        `[createMissingTransactions] Error creating transaction for subscription ${subscription.id} on date ${transactionDate.toISOString()}:`,
        error
      );
    }
  }
  
  // Create notification based on transaction count
  if (transactionCount > 0 && firstTransactionDate && lastTransactionDate) {
    try {
      if (transactionCount === 1) {
        // Single transaction: create individual notification
        const transactionMessage = `「${subscriptionName}」已自動扣款 ${amount}（${walletName}）`;
        
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
      } else {
        // Multiple transactions: create batch notification
        await createBatchTransactionNotification(
          subscription,
          firstTransactionDate,
          lastTransactionDate,
          walletName
        );
      }
    } catch (error) {
      // Log error but don't fail transaction creation
      console.error(
        `[createMissingTransactions] Error creating notification for subscription ${subscription.id}:`,
        error
      );
    }
  }
}

