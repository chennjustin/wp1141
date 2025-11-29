/**
 * Server Action: Create carrier
 * 
 * This action creates a new carrier for the current authenticated user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";
import type { CreateCarrierData } from "../domain/carrier.types";

/**
 * Create a new carrier
 */
export async function createCarrierAction(data: CreateCarrierData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    return await carrierService.createCarrier(session.user.id, data);
  } catch (error) {
    console.error("[createCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

