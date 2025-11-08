'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  type: 'home' | 'profile'
  profileName?: string
  onBack?: () => void
  activeTab?: 'foryou' | 'following'
  onTabChange?: (tab: 'foryou' | 'following') => void
}

export default function Navbar({ type, profileName, onBack, activeTab: externalActiveTab, onTabChange }: NavbarProps) {
  const router = useRouter()
  const [internalActiveTab, setInternalActiveTab] = React.useState<'foryou' | 'following'>('foryou')
  const activeTab = externalActiveTab ?? internalActiveTab

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  if (type === 'profile') {
    return (
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-[620px] mx-auto w-full flex items-center px-4 py-3">
          <div className="flex-shrink-0">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Back"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            {profileName && <h2 className="text-xl font-bold text-gray-900">{profileName}</h2>}
          </div>
          <div className="flex-shrink-0 w-10" />
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-[620px] mx-auto flex border-b border-gray-200">
        <button
          onClick={() => {
            if (onTabChange) {
              onTabChange('foryou')
            } else {
              setInternalActiveTab('foryou')
            }
          }}
          className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
            activeTab === 'foryou'
              ? 'text-gray-900'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          For you
          {activeTab === 'foryou' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full transition-all" />
          )}
        </button>
        <button
          onClick={() => {
            if (onTabChange) {
              onTabChange('following')
            } else {
              setInternalActiveTab('following')
            }
          }}
          className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
            activeTab === 'following'
              ? 'text-gray-900'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Following
          {activeTab === 'following' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full transition-all" />
          )}
        </button>
      </div>
    </nav>
  )
}

