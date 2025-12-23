/**
 * Server Action: Update member role
 * 
 * This action allows wallet owner to update a member's role in the wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletService } from "../services/wallet.service";
import { WalletRole } from "../domain/wallet.types";

/**
 * Update member role in wallet
 */
export async function updateMemberRoleAction(
  walletId: string,
  targetUserId: string,
  newRole: WalletRole
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

    if (!targetUserId || typeof targetUserId !== "string") {
      return {
        success: false,
        error: "Target user ID is required",
        data: null,
      };
    }

    if (newRole !== WalletRole.MEMBER && newRole !== WalletRole.VIEWER) {
      return {
        success: false,
        error: "Role must be either MEMBER or VIEWER",
        data: null,
      };
    }

    return await walletService.updateMemberRole(
      walletId,
      session.user.id,
      targetUserId,
      newRole
    );
  } catch (error) {
    console.error("[updateMemberRoleAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

