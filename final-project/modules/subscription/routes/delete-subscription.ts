/**
 * Server Action: Delete subscription
 * 
 * This action soft deletes a subscription.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";

/**
 * Delete a subscription (soft delete)
 */
export async function deleteSubscriptionAction(subscriptionId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await subscriptionService.deleteSubscription(
      subscriptionId,
      session.user.id
    );
  } catch (error) {
    console.error("[deleteSubscriptionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

