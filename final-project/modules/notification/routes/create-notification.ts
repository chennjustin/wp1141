/**
 * Server Action: Create notification
 * 
 * This action creates a notification for the current user or a specified user.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "../services/notification.service";
import { NotificationType } from "@prisma/client";

interface CreateNotificationData {
  userId?: string; // Optional: if not provided, uses current user
  type: NotificationType;
  message: string;
}

/**
 * Create a notification
 * If userId is not provided, creates notification for the current user
 */
export async function createNotificationAction(data: CreateNotificationData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    // Use provided userId or default to current user
    const targetUserId = data.userId || session.user.id;

    return await notificationService.createNotification(
      targetUserId,
      data.type,
      data.message
    );
  } catch (error) {
    console.error("[createNotificationAction] Unexpected error", error);
    return {
      success: false,
      error: "Internal server error",
      data: null,
    };
  }
}

