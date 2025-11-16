/**
 * Server Action: List user's wallets
 * 
 * This action retrieves all wallets that the current authenticated user can access.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * List all wallets for the current user
 */
export async function listWalletsAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    const wallets = await walletService.getUserWallets(session.user.id);
    return {
      success: true,
      data: wallets,
    };
  } catch (error) {
    console.error("[listWalletsAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

