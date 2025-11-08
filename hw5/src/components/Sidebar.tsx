'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePostModal } from './PostModalProvider'
import LogoutButton from './LogoutButton'
import { pusherClient } from '@/lib/pusher/client'
import { PUSHER_EVENTS } from '@/lib/pusher/events'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { openModal } = usePostModal()
  const { data: session } = useSession()
  const currentUser = session?.user
  const viewerId = currentUser?.id
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const accountSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountSectionRef.current &&
        event.target instanceof Node &&
        !accountSectionRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchUnread = async () => {
      if (!viewerId) return
      try {
        const response = await fetch('/api/notification?limit=1', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error)
      }
    }

    fetchUnread()
  }, [viewerId])

  useEffect(() => {
    if (!viewerId) return

    const pusher = pusherClient()
    const channel = pusher.subscribe(`user-${viewerId}`)

    const handleNotification = () => {
      setUnreadCount((count) => count + 1)
    }

    channel.bind(PUSHER_EVENTS.NOTIFICATION_CREATED, handleNotification)

    return () => {
      channel.unbind(PUSHER_EVENTS.NOTIFICATION_CREATED, handleNotification)
      pusher.unsubscribe(`user-${viewerId}`)
    }
  }, [viewerId])

  useEffect(() => {
    if (pathname === '/notifications') {
      setUnreadCount(0)
    }
  }, [pathname])

  const handleAccountClick = () => {
    setIsAccountMenuOpen((prev) => !prev)
  }

  const navItems = [
    {
      label: 'Home',
      path: '/home',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: (
        <div className="relative">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
          )}
        </div>
      ),
    },
    currentUser?.userId
      ? {
          label: 'Profile',
          path: `/profile/${currentUser.userId}`,
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; path: string; icon: ReactNode }>

  const isActive = (path: string) => {
    if (path === '/home') return pathname === '/home'
    if (path === '/notifications') return pathname?.startsWith('/notifications')
    if (path.startsWith('/profile')) return pathname?.startsWith('/profile')
    return false
  }

  return (
    <aside className="fixed inset-y-0 left-0 flex flex-col border-r border-gray-200 bg-white px-2 sm:px-4 py-4 w-[72px] lg:w-[260px]">
      <div className="mb-4 flex items-center justify-center lg:justify-start">
        <button
          onClick={() => router.push('/home')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Home"
        >
          <span className="text-2xl font-extrabold tracking-tight">X</span>
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex items-center justify-center lg:justify-start gap-4 px-3 py-2 rounded-full transition-colors ${
              isActive(item.path) ? 'font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="hidden lg:inline text-lg">{item.label}</span>
          </button>
        ))}

        <button
          onClick={() => openModal()}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 px-0 py-3 lg:w-full"
        >
          <span className="hidden lg:inline text-lg font-semibold">Post</span>
          <svg
            className="w-6 h-6 lg:hidden"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </nav>

      {currentUser && (
        <div className="mt-4 border-t border-gray-200 pt-4 relative" ref={accountSectionRef}>
          <button
            type="button"
            onClick={handleAccountClick}
            className="w-full flex items-center gap-3 rounded-full px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="true"
          >
            {currentUser?.avatarUrl || currentUser?.image ? (
              <img
                src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                alt={currentUser.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300" />
            )}
            <div className="hidden lg:flex flex-1 min-w-0 flex-col text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser.name || 'Unknown'}
              </p>
              {currentUser.userId && (
                <p className="text-sm text-gray-500 truncate">@{currentUser.userId}</p>
              )}
            </div>
            <svg
              className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform ${
                isAccountMenuOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isAccountMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.name || 'Unknown'}
                </p>
                {currentUser.userId && (
                  <p className="text-sm text-gray-500 truncate">@{currentUser.userId}</p>
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-3">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}


