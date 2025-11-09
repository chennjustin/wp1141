'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import { Post } from '@/types/post'
import { PUSHER_EVENTS, PostLikedPayload, PostRepostedPayload, PostRepliedPayload } from '@/lib/pusher/events'
import { usePusherSubscription } from '@/hooks/usePusherSubscription'

interface PostDetailPageProps {
  parentPost: Post
  replies: Post[]
}

export default function PostDetailPage({ parentPost: initialParentPost, replies: initialReplies }: PostDetailPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const [parentPost, setParentPost] = useState<Post>(initialParentPost)
  const [replies, setReplies] = useState<Post[]>(initialReplies)
  const [replyTarget, setReplyTarget] = useState<Post | null>(null)
  const [displayedRepliesCount, setDisplayedRepliesCount] = useState<number>(10) // 預設顯示 10 則留言

  // 只顯示第一層留言（depth === 0 或 undefined）
  const firstLevelReplies = replies.filter((reply) => (reply.depth ?? 0) === 0)
  const displayedReplies = firstLevelReplies.slice(0, displayedRepliesCount)
  const hasMoreReplies = firstLevelReplies.length > displayedRepliesCount

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

      // Update with server response (use server's likeCount directly)
      if (postId === parentPost.id) {
        setParentPost((current) => ({
          ...current,
          liked: data.liked,
          likeCount: data.likeCount, // Use server's count directly
        }))
      } else {
        setReplies((currentReplies) => {
          const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
          if (currentReplyIndex === -1) return currentReplies

          const finalReplies = [...currentReplies]
          finalReplies[currentReplyIndex] = {
            ...currentReplies[currentReplyIndex],
            liked: data.liked,
            likeCount: data.likeCount, // Use server's count directly
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

  const handleRepost = async (postId: string) => {
    // Find the post (could be parent or reply)
    const post = postId === parentPost.id ? parentPost : replies.find((p) => p.id === postId)
    if (!post) return

    const wasReposted = post.reposted || false
    const previousRepostCount = post.repostCount

    // Optimistic update
    if (postId === parentPost.id) {
      setParentPost({
        ...parentPost,
        reposted: !wasReposted,
        repostCount: wasReposted ? parentPost.repostCount - 1 : parentPost.repostCount + 1,
      })
    } else {
      const replyIndex = replies.findIndex((p) => p.id === postId)
      if (replyIndex !== -1) {
        const updatedReplies = [...replies]
        updatedReplies[replyIndex] = {
          ...replies[replyIndex],
          reposted: !wasReposted,
          repostCount: wasReposted ? replies[replyIndex].repostCount - 1 : replies[replyIndex].repostCount + 1,
        }
        setReplies(updatedReplies)
      }
    }

    try {
      const response = await fetch('/api/repost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle repost')
      }

      const data = await response.json()

      // Update with server response
      if (postId === parentPost.id) {
        setParentPost((current) => ({
          ...current,
          reposted: data.reposted,
          repostCount: data.repostCount,
        }))
      } else {
        setReplies((currentReplies) => {
          const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
          if (currentReplyIndex === -1) return currentReplies

          const currentReply = currentReplies[currentReplyIndex]
          const finalReplies = [...currentReplies]
          finalReplies[currentReplyIndex] = {
            ...currentReply,
            reposted: data.reposted,
            repostCount: data.repostCount,
          }
          return finalReplies
        })
      }
    } catch (error) {
      console.error('Error toggling repost:', error)

      // Rollback
      if (postId === parentPost.id) {
        setParentPost((current) => ({
          ...current,
          reposted: wasReposted,
          repostCount: previousRepostCount,
        }))
      } else {
        setReplies((currentReplies) => {
          const replyIndex = currentReplies.findIndex((p) => p.id === postId)
          if (replyIndex === -1) return currentReplies

          const rollbackReplies = [...currentReplies]
          rollbackReplies[replyIndex] = {
            ...currentReplies[replyIndex],
            reposted: wasReposted,
            repostCount: previousRepostCount,
          }
          return rollbackReplies
        })
      }
    }
  }

  // Subscribe to Pusher events
  const handlePostLiked = useCallback((data: PostLikedPayload) => {
    if (data.postId === parentPost.id) {
      setParentPost((current) => ({
        ...current,
        likeCount: data.likeCount,
      }))
    } else {
      setReplies((currentReplies) => {
        return currentReplies.map((reply) =>
          reply.id === data.postId
            ? { ...reply, likeCount: data.likeCount }
            : reply
        )
      })
    }
  }, [parentPost.id])

  const handlePostReposted = useCallback((data: PostRepostedPayload) => {
    if (data.postId === parentPost.id) {
      setParentPost((current) => ({
        ...current,
        repostCount: data.repostCount,
      }))
    } else {
      setReplies((currentReplies) => {
        return currentReplies.map((reply) =>
          reply.id === data.postId
            ? { ...reply, repostCount: data.repostCount }
            : reply
        )
      })
    }
  }, [parentPost.id])

  const handlePostReplied = useCallback((data: PostRepliedPayload) => {
    if (data.parentId === parentPost.id) {
      setParentPost((current) => ({
        ...current,
        commentCount: data.commentCount,
      }))
    }
  }, [parentPost.id])

  usePusherSubscription('feed', PUSHER_EVENTS.POST_LIKED, handlePostLiked)
  usePusherSubscription('feed', PUSHER_EVENTS.POST_REPOSTED, handlePostReposted)
  usePusherSubscription('feed', PUSHER_EVENTS.POST_REPLIED, handlePostReplied)
  usePusherSubscription(`post-${parentPost.id}`, PUSHER_EVENTS.POST_LIKED, handlePostLiked)
  usePusherSubscription(`post-${parentPost.id}`, PUSHER_EVENTS.POST_REPOSTED, handlePostReposted)
  usePusherSubscription(`post-${parentPost.id}`, PUSHER_EVENTS.POST_REPLIED, handlePostReplied)

  const handleComment = (postId: string) => {
    // 如果點擊的是留言，則 route 到該留言的詳情頁
    const reply = replies.find((p) => p.id === postId)
    if (reply) {
      router.push(`/post/${reply.id}`)
      return
    }
    
    // 如果點擊的是主貼文，則開啟回覆視窗
    if (postId === parentPost.id) {
      setReplyTarget(parentPost)
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

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="flex flex-col">
      {/* Back Button */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={handleBack}
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
          <span className="font-semibold">Post</span>
        </button>
        {parentPost.parent && (
          <Link
            href={`/post/${parentPost.parent.id}`}
            className="text-sm text-blue-500 hover:underline"
          >
            View original post
          </Link>
        )}
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
        {firstLevelReplies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No replies yet. Be the first to reply!</p>
          </div>
        ) : (
          <>
            {displayedReplies.map((reply) => (
              <div key={reply.id} className="border-b border-gray-200">
                <PostCard
                  post={reply}
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
                  showRepostLabel={true}
                />
              </div>
            ))}
            {hasMoreReplies && (
              <div className="p-4 text-center border-b border-gray-200">
                <button
                  onClick={() => setDisplayedRepliesCount((prev) => prev + 10)}
                  className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
                >
                  顯示更多回應
                </button>
              </div>
            )}
          </>
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

