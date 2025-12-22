/**
 * Server Action: Mark notification as unread
 * 
 * This action marks a notification as unread for the current user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "../services/notification.service";

/**
 * Mark a single notification as unread
 */
export async function markNotificationAsUnreadAction(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return await notificationService.markNotificationAsUnread(
      notificationId,
      session.user.id
    );
  } catch (error) {
    console.error("[markNotificationAsUnreadAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

