/**
 * Subscription Transaction Sync Service
 * 
 * This service orchestrates synchronization of transactions created from subscriptions.
 * When a subscription's startDate, endDate, intervalMonths, or amount changes,
 * it coordinates the validation, creation, and amount sync services.
 */

import { prisma } from "@/lib/prisma";
import type { Subscription } from "../domain/subscription.types";
import { validateAndCleanTransactions } from "./transaction-validation.service";
import { createMissingTransactions } from "./transaction-creation.service";
import { syncTransactionAmounts } from "./transaction-amount-sync.service";

/**
 * Find all transactions created by a subscription
 * Uses SubscriptionHistory to identify the relationship
 */


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
        
        // Always recalculate expected dates and validate/clean when startDate, endDate, or intervalMonths changes
        // This ensures transactions are consistent with the new subscription parameters
        // First validate and clean transactions that don't match new rules
        // This will delete transactions that are not in the expected dates list
        console.log(`[syncSubscriptionTransactions] Validating and cleaning transactions`);
        await validateAndCleanTransactions(newSubscription, tx);
        
        // Then create missing transactions for expected dates
        console.log(`[syncSubscriptionTransactions] Creating missing transactions`);
        await createMissingTransactions(newSubscription, tx);
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

