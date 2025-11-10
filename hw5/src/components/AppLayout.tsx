'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import PostModal from './PostModal'

interface AppLayoutProps {
  children: React.ReactNode
  onPostCreated?: () => void
  isMobileMenuOpen?: boolean
  onToggleMobileMenu?: () => void
  onCloseMobileMenu?: () => void
}

export default function AppLayout({ children, onPostCreated, isMobileMenuOpen: externalIsMobileMenuOpen, onToggleMobileMenu: externalOnToggleMobileMenu, onCloseMobileMenu: externalOnCloseMobileMenu }: AppLayoutProps) {
  const [internalIsMobileMenuOpen, setInternalIsMobileMenuOpen] = useState(false)
  const isMobileMenuOpen = externalIsMobileMenuOpen ?? internalIsMobileMenuOpen
  const toggleMobileMenu = externalOnToggleMobileMenu ?? (() => setInternalIsMobileMenuOpen(prev => !prev))
  const closeMobileMenu = externalOnCloseMobileMenu ?? (() => setInternalIsMobileMenuOpen(false))

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Left Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={closeMobileMenu} />

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

