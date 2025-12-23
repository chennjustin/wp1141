/**
 * Notification-related React hooks
 * 
 * This module provides React hooks for notification operations,
 * encapsulating common data fetching and state management logic.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Notification } from "@prisma/client";

/**
 * Hook to get notifications list
 */
export function useNotifications() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (status === "loading" || !session?.user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/notifications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Optimistically update the notification
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Re-fetch on error to ensure consistency
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Optimistically update all notifications
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      // Re-fetch on error to ensure consistency
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAsUnread" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as unread");
      }

      // Optimistically update the notification
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as unread:", err);
      // Re-fetch on error to ensure consistency
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      // Optimistically remove the notification
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      // Re-fetch on error to ensure consistency
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
  };
}

/**
 * Hook to get unread notification count
 * Automatically updates when Pusher notifications are received
 */
export function useUnreadNotificationCount() {
  const { data: session, status } = useSession();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnreadCount() {
      if (status === "loading" || !session?.user?.id) {
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/notifications");
        
        if (!response.ok) {
          return;
        }

        const notifications: Notification[] = await response.json();
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        setCount(unreadCount);
      } catch (err) {
        console.error("Error fetching unread notification count:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session, status]);

  // Expose a function to manually refresh the count
  // This can be called when Pusher notifications are received
  const refreshCount = async () => {
    if (status === "loading" || !session?.user?.id) {
      return;
    }

    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const notifications: Notification[] = await response.json();
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        setCount(unreadCount);
      }
    } catch (err) {
      console.error("Error refreshing unread notification count:", err);
    }
  };

  return {
    count,
    loading,
    refreshCount,
  };
}

