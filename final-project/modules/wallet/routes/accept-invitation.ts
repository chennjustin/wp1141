/**
 * Server Action: Accept wallet invitation
 * 
 * This action allows a user to accept a pending wallet invitation.
 * The user's status will be updated from PENDING to ACCEPTED.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * Accept a wallet invitation
 */
export async function acceptWalletInvitationAction(walletId: string) {
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

    return await walletService.acceptWalletInvitation(
      walletId,
      session.user.id
    );
  } catch (error) {
    console.error("[acceptWalletInvitationAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

