/**
 * Server Action: Get carrier by ID
 * 
 * This action retrieves a single carrier by ID for the current authenticated user.
 * If carrierId is not provided, returns the current user's carrier.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";

/**
 * Get carrier by ID or current user's carrier
 */
export async function getCarrierAction(carrierId?: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    // If carrierId is not provided, get current user's carrier
    if (!carrierId) {
      return await carrierService.getCurrentUserCarrier(session.user.id);
    }

    return await carrierService.getCarrierById(carrierId, session.user.id);
  } catch (error) {
    console.error("[getCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

