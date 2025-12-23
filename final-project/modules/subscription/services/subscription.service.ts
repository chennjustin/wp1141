/**
 * Subscription service
 * 
 * This module contains business logic for Subscription operations.
 * It orchestrates repository calls and implements domain rules
 * such as authorization, validation, and data transformation.
 * It also handles all notification-related operations for subscriptions.
 */

import { prisma } from "@/lib/prisma";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { syncSubscriptionTransactions } from "./sync-subscription-transactions.service";
import {
  createTransactionNotification,
  createReminderNotification,
  deleteSubscriptionNotifications,
  updateReminderNotification,
} from "./subscription-notification.service";
import { BillingStatus } from "@prisma/client";
import type {
  Subscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  SubscriptionServiceResult,
  SubscriptionFilters,
} from "../domain/subscription.types";
import {
  SubscriptionNotFoundError,
  UnauthorizedSubscriptionAccessError,
  InvalidSubscriptionDataError,
} from "../domain/subscription.errors";
import {
  calculateNextBilling,
  shouldCreateTransaction,
} from "../utils/subscription-utils";

/**
 * Subscription service interface
 */
export const subscriptionService = {
  /**
   * Get subscription by ID with authorization check
   */
  async getSubscriptionById(
    subscriptionId: string,
    userId: string
  ): Promise<SubscriptionServiceResult<Subscription>> {
    try {
      const subscription = await subscriptionRepository.findById(
        subscriptionId,
        userId
      );

      if (!subscription) {
        return {
          success: false,
          error: new SubscriptionNotFoundError("Subscription not found"),
          data: undefined,
        };
      }

      // Check wallet access
      const hasAccess = await subscriptionRepository.hasAccess(
        subscription.walletId,
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

      return {
        success: true,
        data: subscription as Subscription,
        error: undefined,
      };
    } catch (error) {
      console.error("[getSubscriptionById] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  },

  /**
   * List subscriptions by wallet with filters
   */
  async listSubscriptions(
    filters: SubscriptionFilters,
    userId: string
  ): Promise<SubscriptionServiceResult<Subscription[]>> {
    try {
      // Check wallet access
      const hasAccess = await subscriptionRepository.hasAccess(
        filters.walletId,
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

      const subscriptions = await subscriptionRepository.findByWalletId({
        ...filters,
        userId,
      });

      return {
        success: true,
        data: subscriptions as Subscription[],
        error: undefined,
      };
    } catch (error) {
      console.error("[listSubscriptions] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  },

  /**
   * List all subscriptions (including deleted) for history page
   */
  async listSubscriptionHistory(
    walletId: string,
    userId: string
  ): Promise<SubscriptionServiceResult<Subscription[]>> {
    try {
      // Check wallet access
      const hasAccess = await subscriptionRepository.hasAccess(walletId, userId);

      if (!hasAccess) {
        return {
          success: false,
          error: new UnauthorizedSubscriptionAccessError(
            "You don't have access to this wallet"
          ),
          data: undefined,
        };
      }

      const subscriptions = await subscriptionRepository.findAllByWalletId(
        walletId,
        userId
      );

      return {
        success: true,
        data: subscriptions as Subscription[],
        error: undefined,
      };
    } catch (error) {
      console.error("[listSubscriptionHistory] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  },

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

      // Calculate nextBilling if not provided
      const startDate = new Date(data.startDate);
      const nextBilling = data.nextBilling
        ? new Date(data.nextBilling)
        : new Date(startDate);

      // Create subscription
      const subscription = await subscriptionRepository.create(userId, {
        ...data,
        nextBilling,
      });

      const subscriptionTyped: Subscription = {
        id: subscription.id,
        walletId: subscription.walletId,
        userId: subscription.userId,
        amount: subscription.amount,
        currency: subscription.currency,
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

      // Check if we need to create a transaction immediately
      // (if startDate is today or in the past)
      if (shouldCreateTransaction(subscriptionTyped)) {
        try {
          const transactionDate = new Date(subscriptionTyped.nextBilling);
          transactionDate.setHours(0, 0, 0, 0);

          // Create transaction
          const transaction = await transactionRepository.create(userId, {
            walletId: subscription.walletId,
            date: transactionDate,
            amount: subscription.amount,
            currency: subscription.currency,
            name: subscription.name || subscription.tag.name,
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

          // Create transaction notification
          await createTransactionNotification(subscriptionTyped, walletName);

          // Calculate next billing date
          const newNextBilling = calculateNextBilling(
            new Date(subscriptionTyped.nextBilling),
            subscriptionTyped.intervalMonths
          );

          // Check if next billing exceeds endDate
          let finalNextBilling = newNextBilling;
          if (subscriptionTyped.endDate) {
            const endDate = new Date(subscriptionTyped.endDate);
            if (newNextBilling > endDate) {
              // Don't update nextBilling if it exceeds endDate
              // The subscription will naturally expire
            } else {
              // Update subscription's nextBilling
              await subscriptionRepository.update(subscription.id, {
                nextBilling: finalNextBilling,
              });
              subscriptionTyped.nextBilling = finalNextBilling;
            }
          } else {
            // Update subscription's nextBilling
            await subscriptionRepository.update(subscription.id, {
              nextBilling: finalNextBilling,
            });
            subscriptionTyped.nextBilling = finalNextBilling;
          }
        } catch (error) {
          // Log error but don't fail subscription creation
          console.error(
            `[createSubscription] Error creating transaction for subscription ${subscription.id}:`,
            error
          );
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

      // Store old subscription data for sync comparison
      const oldSubscription: Subscription = {
        id: existing.id,
        walletId: existing.walletId,
        userId: existing.userId,
        amount: existing.amount,
        currency: existing.currency,
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

      // Update subscription
      const updated = await subscriptionRepository.update(
        subscriptionId,
        data
      );

      // Build new subscription data for sync comparison
      const newSubscription: Subscription = {
        id: updated.id,
        walletId: updated.walletId,
        userId: updated.userId,
        amount: updated.amount,
        currency: updated.currency,
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

      // Update reminder notification if nextBilling changed
      const nextBillingChanged =
        oldSubscription.nextBilling.getTime() !== newSubscription.nextBilling.getTime();
      if (nextBillingChanged) {
        await updateReminderNotification(
          newSubscription,
          oldSubscription.nextBilling,
          walletName
        );
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

  /**
   * Delete subscription (soft delete)
   * Handles:
   * - Deleting all related notifications (reminder and transaction notifications)
   * - Soft deleting the subscription
   */
  async deleteSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<SubscriptionServiceResult<void>> {
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

      // Delete all related notifications
      await deleteSubscriptionNotifications(subscriptionId, existing.userId);

      // Soft delete subscription
      await subscriptionRepository.softDelete(subscriptionId);

      return {
        success: true,
        data: undefined,
        error: undefined,
      };
    } catch (error) {
      console.error("[deleteSubscription] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  },
};
