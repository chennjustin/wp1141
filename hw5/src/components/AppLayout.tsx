'use client'

import React from 'react'
import Sidebar from './Sidebar'
import PostModal from './PostModal'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-[20%] w-[60%] min-h-screen bg-white">
        {children}
      </main>

      {/* Right Spacer - Empty for now */}
      <div className="w-[20%]" />

      {/* Post Modal */}
      <PostModal />
    </div>
  )
}

