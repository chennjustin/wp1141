/**
 * Server Action: Invite users to wallet
 * 
 * This action allows wallet members to invite other users to join their wallet.
 * Invited users will receive a notification and their status will be set to PENDING.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * Invite users to a wallet
 */
export async function inviteUsersToWalletAction(
  walletId: string,
  userIds: string[]
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    // Validate input
    if (!walletId || typeof walletId !== "string") {
      return {
        success: false,
        error: "Wallet ID is required",
        data: null,
      };
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        error: "At least one user ID is required",
        data: null,
      };
    }

    return await walletService.inviteUsersToWallet(
      walletId,
      session.user.id,
      userIds
    );
  } catch (error) {
    console.error("[inviteUsersToWalletAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

