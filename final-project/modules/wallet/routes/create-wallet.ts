/**
 * Server Action: Create wallet
 * 
 * This action creates a new wallet for the current user and attaches
 * them as OWNER.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";
import type { CreateWalletData } from "../domain/wallet.types";

/**
 * Create a new wallet
 */
export async function createWalletAction(data: CreateWalletData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    return await walletService.createWallet(session.user.id, data);
  } catch (error) {
    console.error("[createWalletAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

