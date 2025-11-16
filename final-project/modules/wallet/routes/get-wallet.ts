/**
 * Server Action: Get wallet by ID
 * 
 * This action retrieves detailed information about a single wallet
 * that the user has access to.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * Get wallet by ID
 */
export async function getWalletAction(walletId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    return await walletService.getWalletById(walletId, session.user.id);
  } catch (error) {
    console.error("[getWalletAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

