/**
 * Server Action: Get user's carrier
 * 
 * This action retrieves the current user's carrier.
 * Returns error if user doesn't have a carrier.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";

/**
 * Get user's carrier
 * Returns error if user doesn't have a carrier
 */
export async function getUserCarrierAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    return await carrierService.getCurrentUserCarrier(session.user.id);
  } catch (error) {
    console.error("[getUserCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

