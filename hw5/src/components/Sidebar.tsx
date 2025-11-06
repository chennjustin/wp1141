'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePostModal } from './PostModalProvider'
import LogoutButton from './LogoutButton'

export default function Sidebar() {
  const router = useRouter()
  const { openModal } = usePostModal()
  const { data: session } = useSession()
  const currentUser = session?.user

  return (
    <aside className="fixed left-0 top-0 h-screen w-[20%] border-r border-gray-200 bg-white flex flex-col">
      {/* Logo/App Name */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">X-Clone</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Home Button */}
        <button
          onClick={() => router.push('/home')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
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

        {/* Profile Button */}
        <button
          onClick={() => {
            if (currentUser?.userId) {
              router.push(`/profile/${currentUser.userId}`)
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
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
          onClick={openModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold"
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
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser.name || 'Unknown'}
              </p>
              {currentUser.userId && (
                <p className="text-sm text-gray-500 truncate">
                  @{currentUser.userId}
                </p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      )}
    </aside>
  )
}

