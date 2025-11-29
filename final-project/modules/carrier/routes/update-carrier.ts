/**
 * Server Action: Update carrier
 * 
 * This action updates an existing carrier for the current authenticated user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";
import type { UpdateCarrierData } from "../domain/carrier.types";

/**
 * Update carrier
 */
export async function updateCarrierAction(
  carrierId: string,
  data: UpdateCarrierData
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

    return await carrierService.updateCarrier(carrierId, session.user.id, data);
  } catch (error) {
    console.error("[updateCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

