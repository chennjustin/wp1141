/**
 * Server Action: Delete carrier
 * 
 * This action soft deletes a carrier for the current authenticated user.
 * If carrierId is not provided, deletes the current user's carrier.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";

/**
 * Delete carrier
 * If carrierId is not provided, deletes the current user's carrier
 */
export async function deleteCarrierAction(carrierId?: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    // If carrierId is not provided, delete current user's carrier
    if (!carrierId) {
      return await carrierService.deleteCurrentUserCarrier(session.user.id);
    }

    return await carrierService.deleteCarrier(carrierId, session.user.id);
  } catch (error) {
    console.error("[deleteCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

