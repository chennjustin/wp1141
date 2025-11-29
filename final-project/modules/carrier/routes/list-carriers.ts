/**
 * Server Action: List user's carriers
 * 
 * This action retrieves all carriers that belong to the current authenticated user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carrierService } from "../services/carrier.service";

/**
 * List all carriers for the current user
 */
export async function listCarriersAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    const carriers = await carrierService.getUserCarriers(session.user.id);
    return {
      success: true,
      data: carriers,
    };
  } catch (error) {
    console.error("[listCarriersAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

