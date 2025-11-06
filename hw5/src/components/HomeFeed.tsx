'use client'

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { useSession } from 'next-auth/react'
import InlineComposer from './InlineComposer'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import { Post } from '@/types/post'
import { pusherClient } from '@/lib/pusher/client'
import { PUSHER_EVENTS, PostCreatedPayload, PostLikedPayload, PostRepostedPayload, PostRepliedPayload } from '@/lib/pusher/events'
import Pusher from 'pusher-js'

interface HomeFeedProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>
}

const HomeFeed = forwardRef<{ refresh: () => void }, HomeFeedProps>(
  ({ onRefreshRef }, ref) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [replyTarget, setReplyTarget] = useState<Post | null>(null)
    const { data: session } = useSession()
    const currentUserId = session?.user?.id
    const pusherChannelRef = useRef<any>(null)

    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/post')
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await response.json()
        setPosts(data)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        setIsLoading(false)
      }
    }

    useEffect(() => {
      fetchPosts()
    }, [])

    // Subscribe to Pusher events
    useEffect(() => {
      if (typeof window === 'undefined') return

      let pusher: Pusher | null = null
      try {
        pusher = pusherClient()
        const channel = pusher.subscribe('feed')

        pusherChannelRef.current = channel

        // Handle new post created
        channel.bind(PUSHER_EVENTS.POST_CREATED, (data: PostCreatedPayload) => {
          // Skip if this is our own post (already added via optimistic update)
          if (data.post.authorId === currentUserId) {
            return
          }

          setPosts((currentPosts) => {
            // Check if post already exists
            if (currentPosts.some((p) => p.id === data.post.id)) {
              return currentPosts
            }
            // Add new post at the top
            return [data.post as Post, ...currentPosts]
          })
        })

        // Handle post liked
        // Only update if this is not the current user's action (to avoid double updates)
        channel.bind(PUSHER_EVENTS.POST_LIKED, (data: PostLikedPayload) => {
          setPosts((currentPosts) => {
            return currentPosts.map((post) => {
              if (post.id === data.postId) {
                // Don't update if this post is currently being processed by the user
                // The optimistic update and API response will handle it
                // Only update the count from other users' actions
                return { ...post, likeCount: data.likeCount }
              }
              return post
            })
          })
        })

        // Handle post reposted
        channel.bind(PUSHER_EVENTS.POST_REPOSTED, (data: PostRepostedPayload) => {
          setPosts((currentPosts) => {
            return currentPosts.map((post) =>
              post.id === data.postId
                ? { ...post, repostCount: data.repostCount }
                : post
            )
          })
        })

        // Handle post replied
        channel.bind(PUSHER_EVENTS.POST_REPLIED, (data: PostRepliedPayload) => {
          setPosts((currentPosts) => {
            return currentPosts.map((post) =>
              post.id === data.parentId
                ? { ...post, commentCount: data.commentCount }
                : post
            )
          })
        })
      } catch (error) {
        console.error('Error setting up Pusher subscription:', error)
      }

      // Cleanup on unmount
      return () => {
        if (pusher && pusherChannelRef.current) {
          try {
            pusher.unsubscribe('feed')
          } catch (error) {
            console.error('Error unsubscribing from Pusher:', error)
          }
          pusherChannelRef.current = null
        }
      }
    }, [currentUserId])

    // Expose refresh function to parent
    useImperativeHandle(ref, () => ({
      refresh: fetchPosts,
    }))

    // Also set ref if provided
    useEffect(() => {
      if (onRefreshRef) {
        onRefreshRef.current = fetchPosts
      }
    }, [onRefreshRef])

    const handleRefresh = () => {
      fetchPosts()
    }

    const handleLike = async (postId: string) => {
      // Find the post
      const postIndex = posts.findIndex((p) => p.id === postId)
      if (postIndex === -1) return

      const post = posts[postIndex]
      const wasLiked = post.liked || false
      const previousLikeCount = post.likeCount

      // Optimistic update
      const updatedPosts = [...posts]
      updatedPosts[postIndex] = {
        ...post,
        liked: !wasLiked,
        likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1,
      }
      setPosts(updatedPosts)

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
        setPosts((currentPosts) => {
          const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
          if (currentPostIndex === -1) return currentPosts
          
          const finalPosts = [...currentPosts]
          finalPosts[currentPostIndex] = {
            ...currentPosts[currentPostIndex],
            liked: data.liked,
            likeCount: data.likeCount, // Use server's count directly
          }
          return finalPosts
        })
      } catch (error) {
        console.error('Error toggling like:', error)
        
        // Rollback on error (use current state)
        setPosts((currentPosts) => {
          const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
          if (currentPostIndex === -1) return currentPosts
          
          const rollbackPosts = [...currentPosts]
          rollbackPosts[currentPostIndex] = {
            ...currentPosts[currentPostIndex],
            liked: wasLiked,
            likeCount: previousLikeCount,
          }
          return rollbackPosts
        })
      }
    }

    const handleRepost = async (postId: string) => {
      // Find the post
      const postIndex = posts.findIndex((p) => p.id === postId)
      if (postIndex === -1) return

      const post = posts[postIndex]
      const wasReposted = post.reposted || false
      const previousRepostCount = post.repostCount

      // Optimistic update
      const updatedPosts = [...posts]
      updatedPosts[postIndex] = {
        ...post,
        reposted: !wasReposted,
        repostCount: wasReposted ? post.repostCount - 1 : post.repostCount + 1,
      }
      setPosts(updatedPosts)

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

        // Update with server response (use current state)
        setPosts((currentPosts) => {
          const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
          if (currentPostIndex === -1) return currentPosts

          const currentPost = currentPosts[currentPostIndex]
          const finalPosts = [...currentPosts]
          finalPosts[currentPostIndex] = {
            ...currentPost,
            reposted: data.reposted,
            repostCount: data.repostCount,
          }
          return finalPosts
        })
      } catch (error) {
        console.error('Error toggling repost:', error)

        // Rollback on error (use current state)
        setPosts((currentPosts) => {
          const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
          if (currentPostIndex === -1) return currentPosts

          const rollbackPosts = [...currentPosts]
          rollbackPosts[currentPostIndex] = {
            ...currentPosts[currentPostIndex],
            reposted: wasReposted,
            repostCount: previousRepostCount,
          }
          return rollbackPosts
        })
      }
    }

    const handleComment = (postId: string) => {
      const post = posts.find((p) => p.id === postId)
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

        // Success - refresh feed or show success message
        await fetchPosts()
        // Optional: Show success toast
      } catch (error) {
        console.error('Error posting reply:', error)
        throw error
      }
    }

    return (
      <div className="flex flex-col">
        {/* Inline Composer */}
        <InlineComposer />

        {/* Post List */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                onComment={handleComment}
                onDelete={(postId) => {
                  setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId))
                }}
              />
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
)

HomeFeed.displayName = 'HomeFeed'

export default HomeFeed

