/**
 * Server Action: Leave wallet
 * 
 * This action allows wallet members to leave the wallet.
 * Wallet creator cannot leave the wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * Leave wallet
 */
export async function leaveWalletAction(walletId: string) {
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

    return await walletService.leaveWallet(walletId, session.user.id);
  } catch (error) {
    console.error("[leaveWalletAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

