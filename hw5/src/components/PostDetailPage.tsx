'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import { Post } from '@/types/post'
import { pusherClient } from '@/lib/pusher/client'
import { PUSHER_EVENTS, PostLikedPayload, PostRepostedPayload, PostRepliedPayload } from '@/lib/pusher/events'
import Pusher from 'pusher-js'

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
  const feedChannelRef = useRef<any>(null)
  const postChannelRef = useRef<any>(null)

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
  useEffect(() => {
    if (typeof window === 'undefined') return

    let pusher: Pusher | null = null
    try {
      pusher = pusherClient()
      const feedChannel = pusher.subscribe('feed')
      const postChannel = pusher.subscribe(`post-${parentPost.id}`)

      feedChannelRef.current = feedChannel
      postChannelRef.current = postChannel

      const handlePostLiked = (data: PostLikedPayload) => {
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
      }

      const handlePostReposted = (data: PostRepostedPayload) => {
        if (data.postId === parentPost.id) {
          setParentPost((current) => ({
            ...current,
            repostCount: data.repostCount,
          }))
        } else {
          // Update reply repost count
          setReplies((currentReplies) => {
            return currentReplies.map((reply) =>
              reply.id === data.postId
                ? { ...reply, repostCount: data.repostCount }
                : reply
            )
          })
        }
      }

      const handlePostReplied = (data: PostRepliedPayload) => {
        if (data.parentId === parentPost.id) {
          setParentPost((current) => ({
            ...current,
            commentCount: data.commentCount,
          }))
          // Optionally refresh replies
          // For now, just update the count
        }
      }

      // Bind events on both channels
      feedChannel.bind(PUSHER_EVENTS.POST_LIKED, handlePostLiked)
      feedChannel.bind(PUSHER_EVENTS.POST_REPOSTED, handlePostReposted)
      feedChannel.bind(PUSHER_EVENTS.POST_REPLIED, handlePostReplied)

      postChannel.bind(PUSHER_EVENTS.POST_LIKED, handlePostLiked)
      postChannel.bind(PUSHER_EVENTS.POST_REPOSTED, handlePostReposted)
      postChannel.bind(PUSHER_EVENTS.POST_REPLIED, handlePostReplied)
    } catch (error) {
      console.error('Error setting up Pusher subscription:', error)
    }

    // Cleanup
    return () => {
      if (pusher) {
        try {
          if (feedChannelRef.current) {
            pusher.unsubscribe('feed')
            feedChannelRef.current = null
          }
          if (postChannelRef.current) {
            pusher.unsubscribe(`post-${parentPost.id}`)
            postChannelRef.current = null
          }
        } catch (error) {
          console.error('Error unsubscribing from Pusher:', error)
        }
      }
    }
  }, [parentPost.id])

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
      <div className="px-4 py-3 border-b border-gray-200">
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
          replies.map((reply) => {
            // 計算縮排層級（根據 depth 判斷）
            // depth 0 = 第一層（直接回覆主貼文，不縮排）
            // depth 1+ = 第二層或更深（留言的留言，需要縮排）
            const indentLevel = reply.depth || 0
            const paddingLeft = indentLevel > 0 ? `${indentLevel * 3}rem` : '0'
            
            return (
              <div key={reply.id} className="border-b border-gray-200" style={{ paddingLeft }}>
                <PostCard
                  post={reply}
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
                  showRepostLabel={true}
                />
              </div>
            )
          })
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

