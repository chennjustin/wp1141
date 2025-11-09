'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePusherSubscription } from '@/hooks/usePusherSubscription'
import { useNotifications } from '@/contexts/NotificationContext'
import { PUSHER_EVENTS, NotificationCreatedPayload, NotificationReadPayload } from '@/lib/pusher/events'

interface Notification {
  id: string
  type: 'like' | 'repost' | 'follow' | 'comment' | 'mention'
  senderId: string
  receiverId: string
  postId: string | null
  read: boolean
  createdAt: string
  sender: {
    id: string
    userId: string | null
    name: string | null
    image: string | null
    avatarUrl: string | null
    profileImage?: string | null
  }
  post?: {
    id: string
    content: string
    authorId: string
  } | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const { unreadCount, refreshUnreadCount } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeNotification = (notification: any): Notification => {
    return {
      ...notification,
      sender: {
        ...notification.sender,
        profileImage:
          notification.sender?.profileImage ??
          notification.sender?.avatarUrl ??
          notification.sender?.image ??
          null,
      },
    } as Notification
  }

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/notification')

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      const normalized = (data.notifications as Notification[]).map(normalizeNotification)
      setNotifications(normalized)
      await refreshUnreadCount()
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Subscribe to Pusher notifications
  usePusherSubscription(
    currentUserId ? `user-${currentUserId}` : null,
    PUSHER_EVENTS.NOTIFICATION_CREATED,
    useCallback((data: NotificationCreatedPayload) => {
      const newNotification: Notification = normalizeNotification({
        ...data.notification,
        post: data.notification.post || null,
      })
      setNotifications((current) => [newNotification, ...current])
    }, [])
  )

  usePusherSubscription(
    currentUserId ? `user-${currentUserId}` : null,
    PUSHER_EVENTS.NOTIFICATION_READ,
    useCallback((data: NotificationReadPayload) => {
      setNotifications((current) =>
        current.map((n) => (n.id === data.notificationId ? { ...n, read: true } : n))
      )
    }, [])
  )

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications((current) =>
      current.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )

    try {
      await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
    }

    // 導向對應的貼文或使用者
    if (notification.type === 'follow') {
      // 追蹤通知 → 導向使用者個人頁面
      if (notification.sender.userId) {
        router.push(`/profile/${notification.sender.userId}`)
      }
    } else if (notification.postId) {
      // 按讚、轉發、留言通知 → 導向貼文詳情頁
      router.push(`/post/${notification.postId}`)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const getNotificationText = (notification: Notification) => {
    const senderName = notification.sender.name || notification.sender.userId || 'Someone'
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your post`
      case 'repost':
        return `${senderName} reposted your post`
      case 'comment':
        return `${senderName} commented on your post`
      case 'follow':
        return `${senderName} followed you`
      case 'mention':
        return `${senderName} mentioned you`
      default:
        return 'New notification'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {unreadCount > 0 && (
        <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-200">
          {unreadCount} unread
        </div>
      )}

      {/* Notifications List */}
      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex gap-3 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {notification.sender.profileImage ||
                notification.sender.avatarUrl ||
                notification.sender.image ? (
                  <img
                    src={
                      (notification.sender.profileImage ||
                        notification.sender.avatarUrl ||
                        notification.sender.image) || ''
                    }
                    alt={notification.sender.name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-gray-900 font-semibold">
                    {getNotificationText(notification)}
                  </p>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                {notification.post && (
                  <p className="text-gray-500 text-sm line-clamp-2 mb-1">
                    {notification.post.content}
                  </p>
                )}
                <p className="text-gray-500 text-sm">{formatTimeAgo(notification.createdAt)}</p>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {notification.type === 'like' && (
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
                {notification.type === 'repost' && (
                  <svg
                    className="w-6 h-6 text-green-500"
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
                )}
                {notification.type === 'comment' && (
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                )}
                {notification.type === 'follow' && (
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
                {notification.type === 'mention' && (
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8a4 4 0 00-8 0v3a4 4 0 008 0V9m4-1v3a8 8 0 11-16 0V9"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 12a1 1 0 001-1V8a1 1 0 00-2 0v3a1 1 0 001 1z"
                    />
                  </svg>
                )}
                {!notification.read && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      markNotificationAsRead(notification.id)
                    }}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

