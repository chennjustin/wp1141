'use client'

import React, { useState, useEffect } from 'react'
import { usePostModal } from './PostModalProvider'

interface PostModalProps {
  onPostCreated?: () => void
}

export default function PostModal({ onPostCreated }: PostModalProps) {
  const { isOpen, closeModal } = usePostModal()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const maxLength = 280

  useEffect(() => {
    if (!isOpen) {
      // Clear content when modal closes
      setContent('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handlePost = async () => {
    if (content.trim().length === 0 || content.length > maxLength) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      // Success - close modal and trigger refresh
      closeModal()
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    setContent('')
    closeModal()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={closeModal}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-4">
            {/* Avatar placeholder */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-300" />
            </div>

            {/* Textarea */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What is happening?"
                className="w-full min-h-[200px] resize-none border-none outline-none text-lg placeholder-gray-500"
                maxLength={maxLength}
              />
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`text-sm ${
                    content.length > maxLength * 0.9
                      ? content.length >= maxLength
                        ? 'text-red-500'
                        : 'text-yellow-500'
                      : 'text-gray-500'
                  }`}
                >
                  {content.length}/{maxLength}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handlePost}
            disabled={content.trim().length === 0 || content.length > maxLength || isSubmitting}
            className="px-6 py-2 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

