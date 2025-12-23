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
};

