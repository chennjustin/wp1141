/**
 * Server Action: Update wallet
 * 
 * This action updates wallet basic information (e.g., name, defaultCurrency).
 * Only the wallet owner can update.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";
import type { UpdateWalletData } from "../domain/wallet.types";

/**
 * Update wallet
 */
export async function updateWalletAction(
  walletId: string,
  data: UpdateWalletData
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

    return await walletService.updateWallet(
      walletId,
      session.user.id,
      data
    );
  } catch (error) {
    console.error("[updateWalletAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

