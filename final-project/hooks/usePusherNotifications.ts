/**
 * Pusher Notifications Hook
 * 
 * This hook manages Pusher connection and listens for real-time notifications.
 */

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher-client";
import type { PusherNotificationData } from "@/modules/notification/services/pusher-notification.service";

interface UsePusherNotificationsOptions {
  onNotification?: (notification: PusherNotificationData) => void;
  enabled?: boolean;
}

/**
 * Hook to listen for Pusher notifications
 */
export function usePusherNotifications(options: UsePusherNotificationsOptions = {}) {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const { onNotification, enabled = true } = options;

  useEffect(() => {
    // Don't connect if not authenticated or disabled
    if (status !== "authenticated" || !session?.user?.id || !enabled) {
      return;
    }

    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    const userId = session.user.id;
    const channelName = `user-${userId}`;

    try {
      const pusherClient = getPusherClient();

      // Subscribe to user channel
      const channel = pusherClient.subscribe(channelName);

      // Handle connection state
      const handleConnected = () => {
        setIsConnected(true);
      };

      const handleDisconnected = () => {
        setIsConnected(false);
      };

      // Listen for notification events
      const handleNotification = (data: PusherNotificationData) => {
        if (onNotification) {
          onNotification(data);
        }
      };

      // Bind events
      pusherClient.connection.bind("connected", handleConnected);
      pusherClient.connection.bind("disconnected", handleDisconnected);
      pusherClient.connection.bind("failed", handleDisconnected);
      channel.bind("notification", handleNotification);

      // Set initial connection state
      setIsConnected(pusherClient.connection.state === "connected");

      // Cleanup
      return () => {
        channel.unbind("notification", handleNotification);
        pusherClient.connection.unbind("connected", handleConnected);
        pusherClient.connection.unbind("disconnected", handleDisconnected);
        pusherClient.connection.unbind("failed", handleDisconnected);
        pusherClient.unsubscribe(channelName);
      };
    } catch (error) {
      console.error("[usePusherNotifications] Error initializing Pusher:", error);
    }
  }, [session, status, enabled, onNotification]);

  return {
    isConnected,
  };
}

