/**
 * Server Action: Get subscription
 * 
 * This action retrieves a single subscription by ID.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";

/**
 * Get a subscription by ID
 */
export async function getSubscriptionAction(subscriptionId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await subscriptionService.getSubscriptionById(
      subscriptionId,
      session.user.id
    );
  } catch (error) {
    console.error("[getSubscriptionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

