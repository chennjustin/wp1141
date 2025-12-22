/**
 * Server Action: Create subscription
 * 
 * This action creates a new subscription for a wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { addTransactionFromSubscriptions } from "../services/add-transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";
import type { CreateSubscriptionData } from "../domain/subscription.types";

/**
 * Create a new subscription
 */
export async function createSubscriptionAction(data: CreateSubscriptionData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    const result = await subscriptionService.createSubscription(session.user.id, data);

    // After creating subscription, check if we need to create a transaction immediately
    // This handles the case where startDate is today or in the past
    if (result.success && result.data) {
      try {
        // Process subscriptions to create transactions for those that are due
        // This will check the newly created subscription and create a transaction if needed
        await addTransactionFromSubscriptions();
      } catch (error) {
        // Don't fail the subscription creation if transaction creation fails
        // Just log the error
        console.error("[createSubscriptionAction] Failed to process subscription transactions:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("[createSubscriptionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

