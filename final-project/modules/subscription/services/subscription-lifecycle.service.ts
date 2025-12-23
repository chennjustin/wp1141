/**
 * Subscription Lifecycle Service
 * 
 * Handles subscription creation and update operations:
 * - Create subscription with historical transaction creation
 * - Update subscription with transaction synchronization
 */

import { prisma } from "@/lib/prisma";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { syncSubscriptionTransactions } from "./sync-subscription-transactions.service";
import {
  createTransactionNotification,
  createReminderNotification,
  updateReminderNotification,
  createBatchTransactionNotification,
} from "./subscription-notification.service";
import { BillingStatus } from "@prisma/client";
import type {
  Subscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  SubscriptionServiceResult,
} from "../domain/subscription.types";
import {
  SubscriptionNotFoundError,
  UnauthorizedSubscriptionAccessError,
  InvalidSubscriptionDataError,
} from "../domain/subscription.errors";
import {
  calculateExpectedTransactionDates,
  calculateCorrectNextBilling,
} from "../utils/subscription-utils";
import { findTransactionsBySubscription } from "./transaction-finder.service";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";
import { determineCurrency, determineExchangeRateToDefaultCurrency } from "@/modules/transaction/utils/transaction.currency";

/**
 * Subscription lifecycle service interface
 */
export const subscriptionLifecycleService = {
  /**
   * Create subscription
   * Handles:
   * - Creating the subscription
   * - Creating transaction if startDate is today or in the past
   * - Creating reminder notification if nextBilling is in two days
   */
  async createSubscription(
    userId: string,
    data: CreateSubscriptionData
  ): Promise<SubscriptionServiceResult<Subscription>> {
    try {
      // Validate required fields
      if (!data.walletId) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Wallet ID is required"),
          data: undefined,
        };
      }

      if (!data.tagId) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Tag ID is required"),
          data: undefined,
        };
      }

      if (!data.amount || data.amount <= 0) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Amount must be greater than 0"),
          data: undefined,
        };
      }

      if (!data.startDate) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Start date is required"),
          data: undefined,
        };
      }

      // Check wallet access
      const hasAccess = await subscriptionRepository.hasAccess(
        data.walletId,
        userId
      );

      if (!hasAccess) {
        return {
          success: false,
          error: new UnauthorizedSubscriptionAccessError(
            "You don't have access to this wallet"
          ),
          data: undefined,
        };
      }

      // Get wallet for default currency
      const wallet = await walletRepository.findById(data.walletId, userId);
      if (!wallet) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Wallet not found"),
          data: undefined,
        };
      }

      // Determine currency and exchange rate
      const currency = await determineCurrency(
        data.walletId,
        userId,
        data.currency
      );
      const rateToDefaultCurrency = await determineExchangeRateToDefaultCurrency(
        data.walletId,
        currency,
        wallet.defaultCurrency,
        data.rateToDefaultCurrency
      );

      // Calculate nextBilling based on today's date
      // We'll update it after creating transactions if needed
      const startDate = new Date(data.startDate);
      const initialNextBilling = data.nextBilling
        ? new Date(data.nextBilling)
        : new Date(startDate);

      // Create subscription
      const subscription = await subscriptionRepository.create(userId, {
        ...data,
        currency,
        rateToDefaultCurrency: rateToDefaultCurrency ?? null,
        nextBilling: initialNextBilling,
      });

      const subscriptionTyped: Subscription = {
        id: subscription.id,
        walletId: subscription.walletId,
        userId: subscription.userId,
        amount: subscription.amount,
        currency: subscription.currency,
        rateToDefaultCurrency: subscription.rateToDefaultCurrency,
        nextBilling: new Date(subscription.nextBilling),
        intervalMonths: subscription.intervalMonths,
        startDate: new Date(subscription.startDate),
        endDate: subscription.endDate ? new Date(subscription.endDate) : null,
        type: subscription.type,
        tagId: subscription.tagId,
        name: subscription.name,
        tag: {
          id: subscription.tag.id,
          name: subscription.tag.name,
          iconKey: subscription.tag.iconKey,
        },
        isDeleted: subscription.isDeleted,
        createdAt: new Date(subscription.createdAt),
        updatedAt: new Date(subscription.updatedAt),
      };

      // Get wallet name for notifications
      const wallet = await prisma.wallet.findUnique({
        where: { id: subscription.walletId },
        select: { name: true },
      });
      const walletName = wallet?.name || "未知錢包";

      // If startDate is in the past, create all missing transactions from startDate to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const subscriptionStartDate = new Date(subscriptionTyped.startDate);
      subscriptionStartDate.setHours(0, 0, 0, 0);
      
      if (subscriptionStartDate <= today) {
        try {
          // Calculate all expected transaction dates from startDate to today
          const expectedDates = calculateExpectedTransactionDates(subscriptionTyped);
          
          // Get existing transactions (should be empty for new subscription, but check anyway)
          const existingTransactions = await findTransactionsBySubscription(subscription.id);
          const existingDateKeys = new Set(
            existingTransactions.map((t) => {
              const d = new Date(t.date);
              d.setHours(0, 0, 0, 0);
              return d.toISOString().split("T")[0];
            })
          );

          // Find missing dates (expected but not existing, and <= today)
          const missingDates = expectedDates.filter((date) => {
            const dateKey = date.toISOString().split("T")[0];
            return !existingDateKeys.has(dateKey) && date <= today;
          });

          // Create transactions for all missing dates
          const subscriptionName = subscription.name || subscription.tag.name;
          let lastTransactionDate: Date | null = null;
          let firstTransactionDate: Date | null = null;
          let transactionCount = 0;
          
          for (const transactionDate of missingDates) {
            try {
              // Create transaction
              const transaction = await transactionRepository.create(userId, {
                walletId: subscription.walletId,
                date: transactionDate,
                amount: subscription.amount,
                currency: subscription.currency,
                rateToDefaultCurrency: subscription.rateToDefaultCurrency,
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

              // Track first and last transaction dates
              if (!firstTransactionDate) {
                firstTransactionDate = transactionDate;
              }
              lastTransactionDate = transactionDate;
              transactionCount++;
            } catch (error) {
              // Log error but continue with other dates
              console.error(
                `[createSubscription] Error creating transaction for subscription ${subscription.id} on date ${transactionDate.toISOString()}:`,
                error
              );
            }
          }

          // Create notification based on transaction count
          if (transactionCount > 0 && firstTransactionDate && lastTransactionDate) {
            if (transactionCount === 1) {
              // Single transaction: create individual notification
              await createTransactionNotification(subscriptionTyped, walletName);
            } else {
              // Multiple transactions: create batch notification
              await createBatchTransactionNotification(
                subscriptionTyped,
                firstTransactionDate,
                lastTransactionDate,
                walletName
              );
            }
          }

          // Calculate and update nextBilling based on today's date
          // This ensures nextBilling is always the next billing date from today
          const correctNextBilling = calculateCorrectNextBilling(subscriptionTyped);
          await subscriptionRepository.update(subscription.id, {
            nextBilling: correctNextBilling,
          });
          subscriptionTyped.nextBilling = correctNextBilling;
        } catch (error) {
          // Log error but don't fail subscription creation
          console.error(
            `[createSubscription] Error creating historical transactions for subscription ${subscription.id}:`,
            error
          );
        }
      } else {
        // If startDate is in the future, calculate correct nextBilling
        const correctNextBilling = calculateCorrectNextBilling(subscriptionTyped);
        if (correctNextBilling.getTime() !== subscriptionTyped.nextBilling.getTime()) {
          await subscriptionRepository.update(subscription.id, {
            nextBilling: correctNextBilling,
          });
          subscriptionTyped.nextBilling = correctNextBilling;
        }
      }

      // Create reminder notification if nextBilling is in two days
      await createReminderNotification(subscriptionTyped, walletName);

      return {
        success: true,
        data: subscriptionTyped,
        error: undefined,
      };
    } catch (error) {
      console.error("[createSubscription] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  },

  /**
   * Update subscription
   * Handles:
   * - Updating the subscription
   * - Syncing transactions if startDate, endDate, intervalMonths, or amount changed
   * - Updating reminder notifications if nextBilling changed
   */
  async updateSubscription(
    subscriptionId: string,
    userId: string,
    data: UpdateSubscriptionData
  ): Promise<SubscriptionServiceResult<Subscription>> {
    try {
      // Check if subscription exists and user has access
      const existing = await subscriptionRepository.findById(
        subscriptionId,
        userId
      );

      if (!existing) {
        return {
          success: false,
          error: new SubscriptionNotFoundError("Subscription not found"),
          data: undefined,
        };
      }

      // Check wallet access
      const hasAccess = await subscriptionRepository.hasAccess(
        existing.walletId,
        userId
      );

      if (!hasAccess) {
        return {
          success: false,
          error: new UnauthorizedSubscriptionAccessError(
            "You don't have access to this subscription"
          ),
          data: undefined,
        };
      }

      // Validate amount if provided
      if (data.amount !== undefined && data.amount <= 0) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Amount must be greater than 0"),
          data: undefined,
        };
      }

      // Get wallet for default currency
      const wallet = await walletRepository.findById(existing.walletId, userId);
      if (!wallet) {
        return {
          success: false,
          error: new InvalidSubscriptionDataError("Wallet not found"),
          data: undefined,
        };
      }

      // Determine currency and exchange rate if currency or rate changed
      let finalCurrency = data.currency ?? existing.currency;
      let finalRateToDefaultCurrency = data.rateToDefaultCurrency;
      
      if (data.currency !== undefined || data.rateToDefaultCurrency !== undefined) {
        const currency = await determineCurrency(
          existing.walletId,
          userId,
          data.currency ?? existing.currency
        );
        finalCurrency = currency;
        
        if (data.rateToDefaultCurrency === undefined) {
          // If rate not provided, determine it
          const { determineUpdateExchangeRateToDefaultCurrency } = await import("@/modules/transaction/utils/transaction.currency");
          finalRateToDefaultCurrency = await determineUpdateExchangeRateToDefaultCurrency(
            existing.walletId,
            { currency: existing.currency, rateToDefaultCurrency: existing.rateToDefaultCurrency },
            wallet.defaultCurrency,
            currency,
            undefined
          );
        }
      }

      // Store old subscription data for sync comparison
      const oldSubscription: Subscription = {
        id: existing.id,
        walletId: existing.walletId,
        userId: existing.userId,
        amount: existing.amount,
        currency: existing.currency,
        rateToDefaultCurrency: existing.rateToDefaultCurrency,
        nextBilling: new Date(existing.nextBilling),
        intervalMonths: existing.intervalMonths,
        startDate: new Date(existing.startDate),
        endDate: existing.endDate ? new Date(existing.endDate) : null,
        type: existing.type,
        tagId: existing.tagId,
        name: existing.name,
        tag: {
          id: existing.tag.id,
          name: existing.tag.name,
          iconKey: existing.tag.iconKey,
        },
        isDeleted: existing.isDeleted,
        createdAt: new Date(existing.createdAt),
        updatedAt: new Date(existing.updatedAt),
      };

      // Update subscription with determined currency and rate
      const updateData: UpdateSubscriptionData = {
        ...data,
        currency: finalCurrency,
        rateToDefaultCurrency: finalRateToDefaultCurrency ?? null,
      };
      const updated = await subscriptionRepository.update(
        subscriptionId,
        updateData
      );

      // Build new subscription data for sync comparison
      const newSubscription: Subscription = {
        id: updated.id,
        walletId: updated.walletId,
        userId: updated.userId,
        amount: updated.amount,
        currency: updated.currency,
        rateToDefaultCurrency: updated.rateToDefaultCurrency,
        nextBilling: new Date(updated.nextBilling),
        intervalMonths: updated.intervalMonths,
        startDate: new Date(updated.startDate),
        endDate: updated.endDate ? new Date(updated.endDate) : null,
        type: updated.type,
        tagId: updated.tagId,
        name: updated.name,
        tag: {
          id: updated.tag.id,
          name: updated.tag.name,
          iconKey: updated.tag.iconKey,
        },
        isDeleted: updated.isDeleted,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
      };

      // Get wallet name for notifications
      const wallet = await prisma.wallet.findUnique({
        where: { id: updated.walletId },
        select: { name: true },
      });
      const walletName = wallet?.name || "未知錢包";

      // Sync transactions if startDate, endDate, intervalMonths, or amount changed
      await syncSubscriptionTransactions(
        subscriptionId,
        oldSubscription,
        newSubscription
      );

      // Recalculate nextBilling based on today's date after syncing transactions
      // This ensures nextBilling is always correct
      const correctNextBilling = calculateCorrectNextBilling(newSubscription);
      if (correctNextBilling.getTime() !== newSubscription.nextBilling.getTime()) {
        await subscriptionRepository.update(subscriptionId, {
          nextBilling: correctNextBilling,
        });
        newSubscription.nextBilling = correctNextBilling;
      }

      // Update reminder notification if nextBilling changed (only if not deleted)
      // Note: We keep all existing notifications even when subscription is cancelled/deleted
      if (!newSubscription.isDeleted) {
        const nextBillingChanged =
          oldSubscription.nextBilling.getTime() !== newSubscription.nextBilling.getTime();
        if (nextBillingChanged) {
          await updateReminderNotification(
            newSubscription,
            oldSubscription.nextBilling,
            walletName
          );
        }
      }

      return {
        success: true,
        data: newSubscription,
        error: undefined,
      };
    } catch (error) {
      console.error("[updateSubscription] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  },
};

