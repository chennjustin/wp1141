/**
 * Server Action: Delete wallet
 * 
 * This action soft deletes a wallet and its membership records.
 * Only the wallet owner can delete, and wallets with active transactions
 * cannot be deleted.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";

/**
 * Delete wallet
 */
export async function deleteWalletAction(walletId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return await walletService.deleteWallet(walletId, session.user.id);
  } catch (error) {
    console.error("[deleteWalletAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

