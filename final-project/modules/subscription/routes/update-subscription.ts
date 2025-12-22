/**
 * Server Action: Update subscription
 * 
 * This action updates an existing subscription.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";
import type { UpdateSubscriptionData } from "../domain/subscription.types";

/**
 * Update an existing subscription
 */
export async function updateSubscriptionAction(
  subscriptionId: string,
  data: UpdateSubscriptionData
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await subscriptionService.updateSubscription(
      subscriptionId,
      session.user.id,
      data
    );
  } catch (error) {
    console.error("[updateSubscriptionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

