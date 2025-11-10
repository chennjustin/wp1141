'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import PostModal from './PostModal'
import { useNotifications } from '@/contexts/NotificationContext'

interface AppLayoutProps {
  children: React.ReactNode
  onPostCreated?: () => void
}

export default function AppLayout({ children, onPostCreated }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hamburger Menu Button - Mobile Only, hidden when sidebar is open */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          aria-label="Toggle menu"
        >
          <div className="relative">
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-[20%] w-full md:w-[60%] min-h-screen bg-white overflow-x-hidden">
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Right Spacer - Empty for now, hidden on mobile */}
      <div className="hidden md:block w-[20%]" />

      {/* Post Modal */}
      <PostModal onPostCreated={onPostCreated} />
    </div>
  )
}

