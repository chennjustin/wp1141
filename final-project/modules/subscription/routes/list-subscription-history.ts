/**
 * Server Action: List subscription history
 * 
 * This action lists all subscriptions (including deleted) for a wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "../services/subscription.service";
import { UnauthorizedError, InternalServerError } from "../domain/subscription.errors";

/**
 * List all subscriptions (including deleted) for a wallet
 */
export async function listSubscriptionHistoryAction(walletId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await subscriptionService.listSubscriptionHistory(
      walletId,
      session.user.id
    );
  } catch (error) {
    console.error("[listSubscriptionHistoryAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

