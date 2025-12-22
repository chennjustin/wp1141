/**
 * Server Action: List notifications
 * 
 * This action retrieves all notifications for the current user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "../services/notification.service";

/**
 * Get all notifications for the current user
 */
export async function listNotificationsAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    return await notificationService.getUserNotifications(session.user.id);
  } catch (error) {
    console.error("[listNotificationsAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

