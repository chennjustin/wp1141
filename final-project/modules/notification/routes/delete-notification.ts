/**
 * Server Action: Delete notification
 * 
 * This action soft deletes a notification for the current user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "../services/notification.service";

/**
 * Delete a notification (soft delete)
 */
export async function deleteNotificationAction(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return await notificationService.deleteNotification(
      notificationId,
      session.user.id
    );
  } catch (error) {
    console.error("[deleteNotificationAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

