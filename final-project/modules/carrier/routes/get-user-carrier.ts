/**
 * Server Action: Get user's default or first carrier
 * 
 * This action retrieves the user's default or first carrier.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";

/**
 * Get user's default or first carrier
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

    const carrier = await carrierService.getUserCarrier(session.user.id);
    return {
      success: true,
      data: carrier,
    };
  } catch (error) {
    console.error("[getUserCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

