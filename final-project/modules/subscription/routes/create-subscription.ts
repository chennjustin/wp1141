/**
 * Server Action: Create subscription
 * 
 * This action creates a new subscription for a wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
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

    return await subscriptionService.createSubscription(session.user.id, data);
  } catch (error) {
    console.error("[createSubscriptionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

