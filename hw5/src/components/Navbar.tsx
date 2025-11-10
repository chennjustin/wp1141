'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  type: 'home' | 'profile'
  profileName?: string
  postCount?: number
  onBack?: () => void
  activeTab?: 'foryou' | 'following'
  onTabChange?: (tab: 'foryou' | 'following') => void
  isMobileMenuOpen?: boolean
  onToggleMobileMenu?: () => void
}

export default function Navbar({ type, profileName, postCount, onBack, activeTab: externalActiveTab, onTabChange, isMobileMenuOpen, onToggleMobileMenu }: NavbarProps) {
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
        <div className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
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
          {profileName && (
            <div className="flex flex-col flex-shrink-0 min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">{profileName}</h2>
              {postCount !== undefined && (
                <span className="text-xs md:text-sm text-gray-500">
                  {postCount.toLocaleString()} posts
                </span>
              )}
            </div>
          )}
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-full md:max-w-[620px] mx-auto flex items-center border-b border-gray-200">
        {/* Hamburger Menu Button - Mobile Only */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-3 flex-shrink-0 hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
        <button
          onClick={() => {
            if (onTabChange) {
              onTabChange('foryou')
            } else {
              setInternalActiveTab('foryou')
            }
          }}
          className={`flex-1 px-2 md:px-4 py-3 md:py-4 text-center text-sm md:text-base font-semibold transition-colors relative ${
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
          className={`flex-1 px-2 md:px-4 py-3 md:py-4 text-center text-sm md:text-base font-semibold transition-colors relative ${
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

