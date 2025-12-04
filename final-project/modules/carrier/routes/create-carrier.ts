/**
 * Server Action: Create carrier
 * 
 * This action creates a new carrier for the current authenticated user.
 * System user can create carrier for other users by specifying userId.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SYSTEM_USER_ID } from "@/config/constants";
import { carrierService } from "../services/carrier.service";
import type { CreateCarrierData } from "../domain/carrier.types";

/**
 * Create a new carrier
 * System user can specify userId to create carrier for other users
 */
export async function createCarrierAction(
  data: CreateCarrierData & { userId?: string }
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

    const userId = session.user.id;
    const isSystemUser = userId === SYSTEM_USER_ID;

    // Only system user can specify userId for other users
    const targetUserId = isSystemUser && data.userId ? data.userId : undefined;

    // Extract carrier code from data
    const { userId: _, ...carrierData } = data;

    return await carrierService.createCarrier(userId, carrierData, targetUserId);
  } catch (error) {
    console.error("[createCarrierAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

