'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { usePostModal } from './PostModalProvider'

type ComposerAction = {
  label: string
  icon: JSX.Element
}

const buildComposerActions = (): ComposerAction[] => [
  {
    label: 'Add image or video',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16.5V7a2 2 0 012-2h12a2 2 0 012 2v9.5M4 16.5l3.5-3.5a1.414 1.414 0 012 0L12 15m8-1.5l-3.5-3.5a1.414 1.414 0 00-2 0L12 12"
        />
      </svg>
    ),
  },
  {
    label: 'Add GIF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h4v8H5zM13 8h6m-6 4h4m-4 4h6" />
      </svg>
    ),
  },
  {
    label: 'Create poll',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11h10M7 15h6M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Add emoji',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4a8 8 0 100 16 8 8 0 000-16zm-3 6h.01M15 10h.01M9 15s1.5 2 3 2 3-2 3-2"
        />
      </svg>
    ),
  },
  {
    label: 'Schedule post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V5m8 2V5m-9 4h10m-11 0a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2H6z"
        />
      </svg>
    ),
  },
  {
    label: 'Add location',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 2a7 7 0 00-7 7c0 4.418 7 11 7 11s7-6.582 7-11a7 7 0 00-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z"
        />
      </svg>
    ),
  },
]

export default function InlineComposer() {
  const { openModal } = usePostModal()
  const { data: session } = useSession()
  const currentUser = session?.user
  const actions = useMemo(() => buildComposerActions(), [])

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {currentUser?.avatarUrl || currentUser?.image ? (
            <img
              src={(currentUser?.avatarUrl || currentUser?.image) || ''}
              alt={currentUser?.name || 'User'}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300" />
          )}
        </div>

        <div className="flex-1">
          <button
            onClick={() => openModal()}
            className="w-full text-left px-4 py-3 rounded-2xl border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            What's happening?
          </button>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-500">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => openModal()}
                  title={action.label}
                  className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {action.icon}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openModal()}
              className="px-5 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

