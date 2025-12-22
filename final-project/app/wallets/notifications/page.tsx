"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, useUnreadNotificationCount } from "@/hooks/useNotifications";
import { usePusherNotifications } from "@/hooks/usePusherNotifications";
import { NotificationType } from "@prisma/client";
import type { Notification } from "@prisma/client";

/**
 * Format relative time (e.g., "3 days ago", "1 week ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) {
    return "剛剛";
  } else if (diffMins < 60) {
    return `${diffMins} 分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} 週前`;
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }
}

/**
 * Group notifications by time period
 */
function groupNotificationsByTime(notifications: Notification[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const thisWeek: Notification[] = [];
  const thisMonth: Notification[] = [];
  const older: Notification[] = [];

  notifications.forEach((notification) => {
    const createdAt = new Date(notification.createdAt);
    if (createdAt >= oneWeekAgo) {
      thisWeek.push(notification);
    } else if (createdAt >= oneMonthAgo) {
      thisMonth.push(notification);
    } else {
      older.push(notification);
    }
  });

  return { thisWeek, thisMonth, older };
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.WALLET_INVITATION:
      return (
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      );
    case NotificationType.SUBSCRIPTION_REMINDER:
      return (
        <svg
          className="h-6 w-6 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    case NotificationType.REPAYMENT:
      return (
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case NotificationType.SHARED_WALLET_UPDATE:
      return (
        <svg
          className="h-6 w-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-6 w-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      );
  }
}

/**
 * Extract wallet name from wallet invitation message
 */
function extractWalletNameFromMessage(message: string): string | null {
  // Message format: "{userName} 邀請您加入錢包「{walletName}」"
  const match = message.match(/「([^」]+)」/);
  return match ? match[1] : null;
}

/**
 * Notifications page component
 */
export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, loading, error, markAsRead, markAsUnread, deleteNotification, refetch } = useNotifications();
  const { refreshCount: refreshUnreadCount } = useUnreadNotificationCount();
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());
  const [pendingInvitations, setPendingInvitations] = useState<Map<string, string>>(new Map());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Listen for Pusher notifications
  usePusherNotifications({
    onNotification: () => {
      // Refetch notifications when a new notification arrives
      refetch();
      // Refresh unread count
      refreshUnreadCount();
    },
  });

  // Handle mark as read with refetch to update unread count
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    // Refetch to update the list
    refetch();
    // Refresh unread count immediately
    refreshUnreadCount();
  };

  // Handle mark as unread with refetch to update unread count
  const handleMarkAsUnread = async (notificationId: string) => {
    await markAsUnread(notificationId);
    // Refetch to update the list
    refetch();
    // Refresh unread count immediately
    refreshUnreadCount();
  };

  // Fetch pending wallet invitations to map wallet names to IDs
  useEffect(() => {
    async function fetchPendingInvitations() {
      try {
        const response = await fetch("/api/wallets/pending-invitations");
        if (response.ok) {
          const invitations: Array<{ walletId: string; walletName: string }> = await response.json();
          const map = new Map<string, string>();
          invitations.forEach((inv) => {
            map.set(inv.walletName, inv.walletId);
          });
          setPendingInvitations(map);
        }
      } catch (err) {
        console.error("Error fetching pending invitations:", err);
      }
    }

    fetchPendingInvitations();
  }, []);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByTime(notifications);
  }, [notifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Handle different notification types
    if (notification.type === NotificationType.SUBSCRIPTION_REMINDER) {
      // Extract subscription info from message and navigate to subscriptions page
      router.push("/wallets/subscriptions");
    }
  };

  const handleAcceptInvitation = async (notification: Notification, walletId: string) => {
    if (processingInvitations.has(notification.id)) return;

    try {
      setProcessingInvitations((prev) => new Set(prev).add(notification.id));
      
      const response = await fetch(`/api/wallets/${walletId}/accept-invitation`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      // Mark notification as read
      await markAsRead(notification.id);
      
      // Refresh notifications
      refetch();
      
      // Navigate to the wallet
      router.push(`/wallets/${walletId}`);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      alert("接受邀請失敗，請稍後再試");
    } finally {
      setProcessingInvitations((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const handleRejectInvitation = async (notification: Notification, walletId: string) => {
    if (processingInvitations.has(notification.id)) return;

    try {
      setProcessingInvitations((prev) => new Set(prev).add(notification.id));
      
      const response = await fetch(`/api/wallets/${walletId}/reject-invitation`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reject invitation");
      }

      // Mark notification as read
      await markAsRead(notification.id);
      
      // Refresh notifications
      refetch();
    } catch (err) {
      console.error("Error rejecting invitation:", err);
      alert("拒絕邀請失敗，請稍後再試");
    } finally {
      setProcessingInvitations((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const renderNotificationItem = (notification: Notification) => {
    const walletName = extractWalletNameFromMessage(notification.message);
    const walletId = walletName ? pendingInvitations.get(walletName) : null;
    const isWalletInvitation = notification.type === NotificationType.WALLET_INVITATION;
    const isProcessing = processingInvitations.has(notification.id);

    return (
      <div
        key={notification.id}
        onClick={() => !isWalletInvitation && handleNotificationClick(notification)}
        className={`flex items-start gap-3 p-3 bg-white rounded-lg relative ${
          !isWalletInvitation ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
        }`}
      >
        {/* Unread indicator - red dot */}
        {!notification.isRead && (
          <div className="mt-2 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
        )}
        
        {/* Spacer for read notifications to align content */}
        {notification.isRead && (
          <div className="mt-2 h-2 w-2 flex-shrink-0" />
        )}

        {/* Notification icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Notification content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-black mb-1">{notification.message}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-black/50">
              {formatRelativeTime(new Date(notification.createdAt))}
            </p>
            {/* Mark as read button for unread notifications */}
            {!notification.isRead && !isWalletInvitation && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleMarkAsRead(notification.id);
                }}
                className="px-3 py-1 text-xs font-medium text-black/60 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                已讀
              </button>
            )}
          </div>

          {/* Action buttons for wallet invitation */}
          {isWalletInvitation && walletId && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptInvitation(notification, walletId);
                }}
                disabled={isProcessing}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "處理中..." : "接受"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectInvitation(notification, walletId);
                }}
                disabled={isProcessing}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "處理中..." : "拒絕"}
              </button>
            </div>
          )}
        </div>

        {/* More options (three dots) */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            className="text-black/30 hover:text-black/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === notification.id ? null : notification.id);
            }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {openMenuId === notification.id && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(null);
                }}
              />
              {/* Menu */}
              <div className="absolute right-0 top-6 z-20 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setOpenMenuId(null);
                    await handleMarkAsUnread(notification.id);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-black hover:bg-gray-100 transition-colors"
                >
                  標為未讀
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setOpenMenuId(null);
                    if (confirm("確定要刪除此通知嗎？")) {
                      await deleteNotification(notification.id);
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  刪除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h1 className="text-base font-medium text-black">通知</h1>
        <button
          type="button"
          className="text-black/50 hover:text-black transition-colors"
          onClick={() => router.push("/wallets/settings")}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </header>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">載入中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-red-500" title={error}>
              載入失敗
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">還沒有通知</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* This week */}
            {groupedNotifications.thisWeek.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-black/50 mb-3">This week</h2>
                <div className="space-y-2">
                  {groupedNotifications.thisWeek.map(renderNotificationItem)}
                </div>
              </div>
            )}

            {/* This month */}
            {groupedNotifications.thisMonth.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-black/50 mb-3">This month</h2>
                <div className="space-y-2">
                  {groupedNotifications.thisMonth.map(renderNotificationItem)}
                </div>
              </div>
            )}

            {/* Older */}
            {groupedNotifications.older.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-black/50 mb-3">Older</h2>
                <div className="space-y-2">
                  {groupedNotifications.older.map(renderNotificationItem)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
