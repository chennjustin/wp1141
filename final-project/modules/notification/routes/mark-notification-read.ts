/**
 * Server Action: Mark notification as read
 * 
 * This action marks a notification or all notifications as read for the current user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "../services/notification.service";

/**
 * Mark a single notification as read
 */
export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return await notificationService.markNotificationAsRead(
      notificationId,
      session.user.id
    );
  } catch (error) {
    console.error("[markNotificationAsReadAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsReadAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return await notificationService.markAllNotificationsAsRead(session.user.id);
  } catch (error) {
    console.error("[markAllNotificationsAsReadAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

