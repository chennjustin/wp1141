'use client'

import React from 'react'
import { usePostModal } from './PostModalProvider'
import { getCurrentMockUser } from '@/lib/mockData'

export default function InlineComposer() {
  const { openModal } = usePostModal()
  const currentUser = getCurrentMockUser()

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {currentUser.image ? (
            <img
              src={currentUser.image}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300" />
          )}
        </div>

        {/* Input */}
        <button
          onClick={openModal}
          className="flex-1 text-left px-4 py-3 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-500"
        >
          What is happening?
        </button>
      </div>
    </div>
  )
}

