'use client'

import React from 'react'
import Sidebar from './Sidebar'
import PostModal from './PostModal'

interface AppLayoutProps {
  children: React.ReactNode
  onPostCreated?: () => void
}

export default function AppLayout({ children, onPostCreated }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-[70px] md:ml-[20%] w-full md:w-[60%] min-h-screen bg-white">
        {children}
      </main>

      {/* Right Spacer - Empty for now, hidden on mobile */}
      <div className="hidden md:block w-[20%]" />

      {/* Post Modal */}
      <PostModal onPostCreated={onPostCreated} />
    </div>
  )
}

