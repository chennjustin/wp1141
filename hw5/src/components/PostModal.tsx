'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePostModal } from './PostModalProvider'
import MediaUploader from './MediaUploader'

interface PostModalProps {
  onPostCreated?: () => void
}

export default function PostModal({ onPostCreated }: PostModalProps) {
  const { isOpen, closeModal } = usePostModal()
  const { data: session } = useSession()
  const currentUser = session?.user
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const maxLength = 280

  useEffect(() => {
    if (!isOpen) {
      // Clear content when modal closes
      setContent('')
      setMediaUrl(null)
      setMediaType(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setMediaUrl(url || null)
    setMediaType(url ? type : null)
  }

  const handlePost = async () => {
    if (content.trim().length === 0 || content.length > maxLength) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      // Success - close modal and trigger refresh
      setContent('')
      setMediaUrl(null)
      setMediaType(null)
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
    setMediaUrl(null)
    setMediaType(null)
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
            {/* Avatar */}
            <div className="flex-shrink-0">
              {currentUser?.avatarUrl || currentUser?.image ? (
                <img
                  src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                  alt={currentUser.name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300" />
              )}
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
              
              {/* Media Preview */}
              {mediaUrl && (
                <div className="relative mt-4 rounded-2xl overflow-hidden">
                  {mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full max-h-96 object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Media preview"
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                  {!isSubmitting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMediaUrl(null)
                        setMediaType(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
                      aria-label="Remove media"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <MediaUploader
                  type="post"
                  existingUrl={mediaUrl}
                  onUpload={handleMediaUpload}
                  disabled={isSubmitting}
                />
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

