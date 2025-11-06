'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import { Post } from '@/types/post'

interface PostDetailPageProps {
  parentPost: Post
  replies: Post[]
}

export default function PostDetailPage({ parentPost: initialParentPost, replies: initialReplies }: PostDetailPageProps) {
  const router = useRouter()
  const [parentPost, setParentPost] = useState<Post>(initialParentPost)
  const [replies, setReplies] = useState<Post[]>(initialReplies)
  const [replyTarget, setReplyTarget] = useState<Post | null>(null)

  const handleLike = async (postId: string) => {
    // Find the post (could be parent or reply)
    const post = postId === parentPost.id ? parentPost : replies.find((p) => p.id === postId)
    if (!post) return

    const wasLiked = post.liked || false
    const previousLikeCount = post.likeCount

    // Optimistic update
    if (postId === parentPost.id) {
      setParentPost({
        ...parentPost,
        liked: !wasLiked,
        likeCount: wasLiked ? parentPost.likeCount - 1 : parentPost.likeCount + 1,
      })
    } else {
      const replyIndex = replies.findIndex((p) => p.id === postId)
      if (replyIndex !== -1) {
        const updatedReplies = [...replies]
        updatedReplies[replyIndex] = {
          ...replies[replyIndex],
          liked: !wasLiked,
          likeCount: wasLiked ? replies[replyIndex].likeCount - 1 : replies[replyIndex].likeCount + 1,
        }
        setReplies(updatedReplies)
      }
    }

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()

      // Update with server response
      if (postId === parentPost.id) {
        setParentPost((current) => ({
          ...current,
          liked: data.liked,
          likeCount: data.liked
            ? current.likeCount + 1
            : Math.max(0, current.likeCount - 1),
        }))
      } else {
        setReplies((currentReplies) => {
          const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
          if (currentReplyIndex === -1) return currentReplies

          const currentReply = currentReplies[currentReplyIndex]
          const finalReplies = [...currentReplies]
          finalReplies[currentReplyIndex] = {
            ...currentReply,
            liked: data.liked,
            likeCount: data.liked
              ? currentReply.likeCount + 1
              : Math.max(0, currentReply.likeCount - 1),
          }
          return finalReplies
        })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Rollback
      if (postId === parentPost.id) {
        setParentPost((current) => ({
          ...current,
          liked: wasLiked,
          likeCount: previousLikeCount,
        }))
      } else {
        setReplies((currentReplies) => {
          const replyIndex = currentReplies.findIndex((p) => p.id === postId)
          if (replyIndex === -1) return currentReplies

          const rollbackReplies = [...currentReplies]
          rollbackReplies[replyIndex] = {
            ...currentReplies[replyIndex],
            liked: wasLiked,
            likeCount: previousLikeCount,
          }
          return rollbackReplies
        })
      }
    }
  }

  const handleRepost = (postId: string) => {
    console.log('Repost:', postId)
    // TODO: Call API
  }

  const handleComment = (postId: string) => {
    // For replies, open reply modal
    // For parent post, also open reply modal
    const post = postId === parentPost.id ? parentPost : replies.find((p) => p.id === postId)
    if (post) {
      setReplyTarget(post)
    }
  }

  const handleReplySubmit = async (content: string) => {
    if (!replyTarget) return

    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: replyTarget.id, content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to post reply')
      }

      // Success - refresh page or add reply to list
      // For now, reload the page
      window.location.reload()
    } catch (error) {
      console.error('Error posting reply:', error)
      throw error
    }
  }

  return (
    <div className="flex flex-col">
      {/* Back Button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => router.push('/home')}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
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
          <span className="font-semibold">Back</span>
        </button>
      </div>

      {/* Parent Post */}
      <div className="border-b border-gray-200">
        <PostCard
          post={parentPost}
          onLike={handleLike}
          onRepost={handleRepost}
          onComment={handleComment}
        />
      </div>

      {/* Replies */}
      <div className="flex flex-col">
        {replies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No replies yet. Be the first to reply!</p>
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="border-b border-gray-200 pl-12">
              <PostCard
                post={reply}
                onLike={handleLike}
                onRepost={handleRepost}
                onComment={handleComment}
              />
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <ReplyModal
        open={replyTarget !== null}
        onClose={() => setReplyTarget(null)}
        parentPost={replyTarget}
        onSubmit={handleReplySubmit}
      />
    </div>
  )
}

