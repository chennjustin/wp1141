/**
 * Server Action: List user's carriers
 * 
 * This action retrieves all carriers that belong to the current authenticated user.
 * System user can retrieve all carriers from all users.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SYSTEM_USER_ID } from "@/config/constants";
import { carrierService } from "../services/carrier.service";

/**
 * List all carriers for the current user
 * System user can list all carriers from all users
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

    const userId = session.user.id;
    const isSystemUser = userId === SYSTEM_USER_ID;

    // System user can list all carriers
    const carriers = isSystemUser
      ? await carrierService.getAllCarriers()
      : await carrierService.getUserCarriers(userId);

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

