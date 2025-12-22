/**
 * Pusher Notification Service
 * 
 * This service handles sending real-time notifications via Pusher.
 */

import { getPusherServer } from "@/lib/pusher-server";
import { NotificationType } from "@prisma/client";

export interface PusherNotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Send a real-time notification to a user via Pusher
 * 
 * @param userId - The user ID to send the notification to
 * @param type - The notification type
 * @param message - The notification message
 * @param notificationId - The notification ID (optional, for existing notifications)
 */
export async function sendPusherNotification(
  userId: string,
  type: NotificationType,
  message: string,
  notificationId?: string
): Promise<void> {
  try {
    const pusherServer = getPusherServer();
    
    // If Pusher is not configured, skip sending notification
    if (!pusherServer) {
      return;
    }

    const channel = `user-${userId}`;
    const notificationData: PusherNotificationData = {
      id: notificationId || `temp-${Date.now()}`,
      userId,
      type,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await pusherServer.trigger(channel, "notification", notificationData);
  } catch (error) {
    // Log error but don't fail the entire process
    console.error("[sendPusherNotification] Error sending notification:", error);
  }
}

