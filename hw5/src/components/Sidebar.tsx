'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePostModal } from './PostModalProvider'
import LogoutButton from './LogoutButton'
import { useNotifications } from '@/contexts/NotificationContext'

interface SidebarProps {
  isMobileMenuOpen?: boolean
  onCloseMobileMenu?: () => void
}

export default function Sidebar({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) {
  const router = useRouter()
  const { openModal } = usePostModal()
  const { data: session } = useSession()
  const currentUser = session?.user
  const { unreadCount } = useNotifications()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountSectionRef.current || !(event.target instanceof Node)) {
        return
      }

      // Check if click is outside the account section (including the popup menu)
      // The popup menu is a child of accountSectionRef, so contains() will return true for clicks inside it
      if (!accountSectionRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    if (isAccountMenuOpen) {
      // Use click event instead of mousedown to ensure button onClick fires first
      // stopPropagation on popup and button will prevent this from firing for clicks inside
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isAccountMenuOpen])

  const handleAccountClick = () => {
    setIsAccountMenuOpen((prev) => !prev)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    onCloseMobileMenu?.()
  }

  const handlePostClick = () => {
    openModal()
    onCloseMobileMenu?.()
  }

  return (
    <>
      {/* Mobile Sidebar - Slide in from left */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-white flex flex-col z-50 overflow-hidden transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex-shrink-0 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">my X</h1>
          {isMobileMenuOpen && onCloseMobileMenu && (
            <button
              onClick={onCloseMobileMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {/* Home Button */}
          <button
            onClick={() => handleNavigation('/home')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left flex-shrink-0"
          >
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
            <span className="text-lg font-medium">Home</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => handleNavigation('/notifications')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left relative flex-shrink-0"
          >
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
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-lg font-medium">Notifications</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              if (currentUser?.userId) {
                handleNavigation(`/profile/${currentUser.userId}`)
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left flex-shrink-0"
          >
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
            <span className="text-lg font-medium">Profile</span>
          </button>

          {/* Post Button - Highlighted */}
          <button
            onClick={handlePostClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold flex-shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Post</span>
          </button>
        </nav>

        {/* User Info */}
        {currentUser && (
          <div className="p-4 border-t border-gray-200 relative flex-shrink-0 z-50" ref={accountSectionRef}>
            <button
              type="button"
              onClick={handleAccountClick}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="true"
            >
              {currentUser?.avatarUrl || currentUser?.image ? (
                <img
                  src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                  alt={currentUser.name || 'User'}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.name || 'Unknown'}
                </p>
                {currentUser.userId && (
                  <p className="text-sm text-gray-500 truncate">@{currentUser.userId}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>

            {isAccountMenuOpen && (
              <div 
                className="absolute bottom-full left-4 right-4 mb-3 rounded-xl border border-gray-200 bg-white shadow-xl z-[60]"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
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

      {/* Desktop Sidebar - Always visible */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[20%] border-r border-gray-200 bg-white flex-col z-40 overflow-hidden">
        {/* Logo/App Name */}
        <div className="p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">my X</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {/* Home Button */}
          <button
            onClick={() => router.push('/home')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left flex-shrink-0"
          >
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
            <span className="text-lg font-medium">Home</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => router.push('/notifications')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left relative flex-shrink-0"
          >
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
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-lg font-medium">Notifications</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              if (currentUser?.userId) {
                router.push(`/profile/${currentUser.userId}`)
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left flex-shrink-0"
          >
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
            <span className="text-lg font-medium">Profile</span>
          </button>

          {/* Post Button - Highlighted */}
          <button
            onClick={() => openModal()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold flex-shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Post</span>
          </button>
        </nav>

        {/* User Info */}
        {currentUser && (
          <div className="p-4 border-t border-gray-200 relative flex-shrink-0" ref={accountSectionRef}>
            <button
              type="button"
              onClick={handleAccountClick}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="true"
            >
              {currentUser?.avatarUrl || currentUser?.image ? (
                <img
                  src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                  alt={currentUser.name || 'User'}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.name || 'Unknown'}
                </p>
                {currentUser.userId && (
                  <p className="text-sm text-gray-500 truncate">@{currentUser.userId}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>

            {isAccountMenuOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-3 rounded-xl border border-gray-200 bg-white shadow-xl">
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
    </>
  )
}
