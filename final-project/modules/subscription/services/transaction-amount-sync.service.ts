/**
 * Transaction Amount Sync Service
 * 
 * Syncs transaction amounts when subscription amount changes.
 * Updates transaction amount and related TransactionPayer/TransactionShare amounts.
 * Also deletes old notifications and creates new ones with updated amount.
 */

import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { notificationRepository } from "@/modules/notification/repositories/notification.repository";
import { sendPusherNotification } from "@/modules/notification/services/pusher-notification.service";
import { NotificationType } from "@prisma/client";
import type { Subscription } from "../domain/subscription.types";
import { formatAmount } from "../utils/subscription-utils";
import { findTransactionsBySubscription } from "./transaction-finder.service";
import { deleteNotificationsForTransaction } from "./transaction-notification-deletion.service";

/**
 * Sync transaction amounts when subscription amount changes
 * 
 * Updates transaction amount and related TransactionPayer/TransactionShare amounts
 * Also deletes old notifications and creates new ones with updated amount
 */
export async function syncTransactionAmounts(
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
    const fullSubscription = await (tx || prisma).subscription.findFirst({
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

