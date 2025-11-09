'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePusherSubscription } from '@/hooks/usePusherSubscription'
import { PUSHER_EVENTS, NotificationReadPayload } from '@/lib/pusher/events'

interface NotificationContextValue {
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = useCallback(async () => {
    if (!currentUserId) {
      setUnreadCount(0)
      return
    }

    try {
      const response = await fetch('/api/notification')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [currentUserId])

  // Initial fetch
  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  // Subscribe to notification events
  usePusherSubscription(
    currentUserId ? `user-${currentUserId}` : null,
    PUSHER_EVENTS.NOTIFICATION_CREATED,
    useCallback(() => {
      setUnreadCount((prev) => prev + 1)
    }, [])
  )

  usePusherSubscription(
    currentUserId ? `user-${currentUserId}` : null,
    PUSHER_EVENTS.NOTIFICATION_READ,
    useCallback((data: NotificationReadPayload) => {
      setUnreadCount(data.unreadCount)
    }, [])
  )

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

