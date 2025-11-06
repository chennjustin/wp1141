'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Post } from '@/types/post'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onRepost?: (postId: string) => void
  onComment?: (postId: string) => void
  onDelete?: (postId: string) => void
}

export default function PostCard({ post, onLike, onRepost, onComment, onDelete }: PostCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const currentUser = session?.user
  const [showDeleteMenu, setShowDeleteMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = currentUser?.id === post.authorId

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const handleLike = () => {
    if (onLike) {
      onLike(post.id)
    } else {
      console.log('Like clicked:', post.id)
    }
  }

  const handleRepost = () => {
    if (onRepost) {
      onRepost(post.id)
    } else {
      console.log('Repost clicked:', post.id)
    }
  }

  const handleComment = () => {
    if (onComment) {
      onComment(post.id)
    } else {
      // Default: navigate to post detail page
      router.push(`/post/${post.id}`)
    }
  }

  const handleDelete = async () => {
    if (!isAuthor || !onDelete) return

    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/post/${post.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete post')
      }

      // Call onDelete callback to remove from feed
      onDelete(post.id)
      setShowDeleteMenu(false)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors relative">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {post.author?.image ? (
            <img
              src={post.author.image}
              alt={post.author?.name || 'User'}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
            {post.author?.userId ? (
              <Link
                href={`/profile/${post.author.userId}`}
                className="flex items-center gap-2 hover:underline"
              >
                <span className="font-semibold text-gray-900">{post.author?.name || 'Unknown'}</span>
                <span className="text-gray-500">@{post.author?.userId}</span>
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{post.author?.name || 'Unknown'}</span>
            )}
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatTimeAgo(post.createdAt)}</span>
            </div>
            
            {/* Delete Button (only for author) */}
            {isAuthor && onDelete && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteMenu(!showDeleteMenu)
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="More options"
                  disabled={isDeleting}
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Delete Menu */}
                {showDeleteMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDeleteMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[120px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                        }}
                        disabled={isDeleting}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Post Content - Clickable to view post detail */}
          <div className="mb-3">
            <button
              onClick={() => router.push(`/post/${post.id}`)}
              className="text-left w-full"
            >
              <p className="text-gray-900 whitespace-pre-wrap break-words hover:underline">
                {post.content}
                {/* TODO: Add hashtag/mention highlighting */}
              </p>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-8 text-gray-500">
            {/* Comment */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleComment()
              }}
              className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
            >
              <svg
                className="w-5 h-5 group-hover:bg-blue-100 rounded-full p-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span 
                className="text-sm hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/post/${post.id}`)
                }}
              >
                {post.commentCount}
              </span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              className="flex items-center gap-2 hover:text-green-500 transition-colors group"
            >
              <svg
                className="w-5 h-5 group-hover:bg-green-100 rounded-full p-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm">{post.repostCount}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors group ${
                post.liked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              {post.liked ? (
                <svg
                  className="w-5 h-5 group-hover:bg-red-100 rounded-full p-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 group-hover:bg-red-100 rounded-full p-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              <span className="text-sm">{post.likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

