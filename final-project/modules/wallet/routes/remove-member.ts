/**
 * Server Action: Remove member from wallet
 * 
 * This action allows wallet creator to remove other members from the wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * Remove member from wallet
 */
export async function removeMemberAction(
  walletId: string,
  targetUserId: string
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate input
    if (!walletId || typeof walletId !== "string") {
      return {
        success: false,
        error: "Wallet ID is required",
      };
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return {
        success: false,
        error: "Target user ID is required",
      };
    }

    return await walletService.removeMemberFromWallet(
      walletId,
      session.user.id,
      targetUserId
    );
  } catch (error) {
    console.error("[removeMemberAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

