/**
 * Transaction Validation Service
 * 
 * Validates and cleans transactions that don't match subscription rules.
 * Deletes transactions that are before startDate, after endDate, or don't match expected billing dates.
 */

import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import type { Subscription } from "../domain/subscription.types";
import { calculateExpectedTransactionDates } from "../utils/subscription-utils";
import { findTransactionsBySubscription } from "./transaction-finder.service";
import { deleteTransactionNotificationsForDate } from "./transaction-notification-deletion.service";

/**
 * Validate and clean transactions that don't match subscription rules
 * Deletes transactions that:
 * - Are before startDate
 * - Are after endDate (if exists)
 * - Don't match expected billing dates
 */
export async function validateAndCleanTransactions(
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

