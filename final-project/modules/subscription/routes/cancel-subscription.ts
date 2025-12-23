/**
 * Server Action: Cancel subscription
 * 
 * This action cancels a subscription by:
 * 1. Setting its endDate to today (stops future billing)
 * 2. Setting isDeleted to true (marks as deleted)
 * 3. Triggering transaction synchronization to remove future transactions
 * 4. Deleting all related notifications
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";

/**
 * Cancel a subscription by setting endDate to today and marking as deleted
 */
export async function cancelSubscriptionAction(subscriptionId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    // Set endDate to today and mark as deleted
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    return await subscriptionService.updateSubscription(
      subscriptionId,
      session.user.id,
      {
        endDate: todayString,
        isDeleted: true,
      }
    );
  } catch (error) {
    console.error("[cancelSubscriptionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

