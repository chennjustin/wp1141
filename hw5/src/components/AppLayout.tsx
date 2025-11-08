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
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex justify-center ml-[72px] lg:ml-[260px]">
        <main className="w-full max-w-[620px] min-h-screen border-x border-gray-200">
          {children}
        </main>
        <div className="hidden xl:flex flex-1 bg-white" />
      </div>

      <PostModal onPostCreated={onPostCreated} />
    </div>
  )
}

