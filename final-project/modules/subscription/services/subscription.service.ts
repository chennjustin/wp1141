/**
 * Subscription service
 * 
 * This module contains business logic for Subscription operations.
 * It orchestrates repository calls and implements domain rules
 * such as authorization, validation, and data transformation.
 */

import { subscriptionRepository } from "../repositories/subscription.repository";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";
import { syncSubscriptionTransactions } from "./sync-subscription-transactions.service";
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
  ValidationError,
} from "../domain/subscription.errors";

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
      const nextBilling = data.nextBilling
        ? new Date(data.nextBilling)
        : new Date(data.startDate);

      const subscription = await subscriptionRepository.create(userId, {
        ...data,
        nextBilling,
      });

      return {
        success: true,
        data: subscription as Subscription,
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

      // Sync transactions if startDate or amount changed
      await syncSubscriptionTransactions(
        subscriptionId,
        oldSubscription,
        newSubscription
      );

      return {
        success: true,
        data: newSubscription,
        error: null,
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

