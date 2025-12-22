/**
 * Server Action: List subscriptions
 * 
 * This action lists all active subscriptions for a wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";
import type { SubscriptionFilters } from "../domain/subscription.types";

/**
 * List active subscriptions for a wallet
 */
export async function listSubscriptionsAction(filters: SubscriptionFilters) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await subscriptionService.listSubscriptions(
      filters,
      session.user.id
    );
  } catch (error) {
    console.error("[listSubscriptionsAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

