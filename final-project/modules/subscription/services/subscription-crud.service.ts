/**
 * Subscription CRUD Service
 * 
 * Handles basic CRUD operations for subscriptions:
 * - Get subscription by ID
 * - List subscriptions
 * - List subscription history
 */

import { subscriptionRepository } from "../repositories/subscription.repository";
import type {
  Subscription,
  SubscriptionServiceResult,
  SubscriptionFilters,
} from "../domain/subscription.types";
import {
  SubscriptionNotFoundError,
  UnauthorizedSubscriptionAccessError,
} from "../domain/subscription.errors";

/**
 * Subscription CRUD service interface
 */
export const subscriptionCrudService = {
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

      // Convert Prisma model to Domain type with payers and shares
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
        payers: (subscription as any).payers?.map((p: any) => ({
          payerId: p.payerId,
          paidAmount: p.paidAmount,
        })),
        shares: (subscription as any).shares?.map((s: any) => ({
          userId: s.userId,
          shareAmount: s.shareAmount,
        })),
      };

      return {
        success: true,
        data: subscriptionTyped,
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
};

