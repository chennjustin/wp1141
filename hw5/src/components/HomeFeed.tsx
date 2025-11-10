'use client'

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import InlineComposer from './InlineComposer'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import { Post } from '@/types/post'
import { PUSHER_EVENTS, PostCreatedPayload, PostLikedPayload, PostRepostedPayload, PostRepliedPayload } from '@/lib/pusher/events'
import { usePusherSubscription } from '@/hooks/usePusherSubscription'

interface HomeFeedProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>
  activeTab?: 'foryou' | 'following'
}

const HomeFeed = forwardRef<{ refresh: () => void }, HomeFeedProps>(
  ({ onRefreshRef, activeTab = 'foryou' }, ref) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [replyTarget, setReplyTarget] = useState<Post | null>(null)
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
    const followingIdsRef = useRef<Set<string>>(new Set())
    const [newPostNotice, setNewPostNotice] = useState<{
      authors: Array<{ id: string; name: string | null; userId: string | null; avatarUrl: string | null; image: string | null }>
      postId: string | null
    } | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()
    const currentUserId = session?.user?.id

    // Track scroll position
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fetchPosts = async (tab: 'foryou' | 'following' = activeTab) => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Clear new post notice when refreshing
        setNewPostNotice(null)
        
        // 根據 activeTab 選擇 API endpoint
        const apiUrl = tab === 'following' 
          ? '/api/feed?filter=following'
          : '/api/post'
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await response.json()
        
        // 處理不同的 API 響應格式
        if (tab === 'following') {
          // feed API 返回的是 posts 數組
          setPosts(data)
        } else {
          // post API 現在返回的是 posts 數組
          setPosts(data || [])
        }
        
        // 切換後滾動到頂部
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setIsScrolled(false)
        }
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch following IDs
    useEffect(() => {
      if (!currentUserId) return

      const fetchFollowing = async () => {
        try {
          const response = await fetch('/api/user/me/following-ids')
          if (response.ok) {
            const data = await response.json()
            const ids = new Set<string>(data.followingIds || [])
            setFollowingIds(ids)
            followingIdsRef.current = ids
          }
        } catch (error) {
          console.error('Error fetching following:', error)
        }
      }

      fetchFollowing()
    }, [currentUserId])

    // 當 activeTab 改變時重新載入
    useEffect(() => {
      setNewPostNotice(null) // Clear notice when switching tabs
      fetchPosts(activeTab)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab])

    // Subscribe to Pusher events
    usePusherSubscription(
      'feed',
      PUSHER_EVENTS.POST_CREATED,
      useCallback((data: PostCreatedPayload) => {
        // Skip if this is our own post (already added via optimistic update)
        if (data.post.authorId === currentUserId) {
          return
        }

        // Check if the author is someone we're following
        if (followingIdsRef.current.has(data.post.authorId)) {
          // Add to new post notice
          setNewPostNotice((prev) => {
            const author = {
              id: data.post.author.id,
              name: data.post.author.name,
              userId: data.post.author.userId,
              avatarUrl: data.post.author.avatarUrl || data.post.author.image,
              image: data.post.author.image,
            }

            if (!prev) {
              return {
                authors: [author],
                postId: data.post.id,
              }
            }

            // Check if author already exists
            const existingIndex = prev.authors.findIndex((a) => a.id === author.id)
            if (existingIndex !== -1) {
              // Move to front
              const updatedAuthors = [
                author,
                ...prev.authors.filter((a) => a.id !== author.id),
              ].slice(0, 3) // Keep only first 3
              return {
                authors: updatedAuthors,
                postId: data.post.id,
              }
            }

            // Add new author, keep only first 3
            const updatedAuthors = [author, ...prev.authors].slice(0, 3)
            return {
              authors: updatedAuthors,
              postId: data.post.id,
            }
          })
        }

        setPosts((currentPosts) => {
          // Check if post already exists
          if (currentPosts.some((p) => p.id === data.post.id)) {
            return currentPosts
          }
          // Add new post at the top
          return [data.post as Post, ...currentPosts]
        })
      }, [currentUserId])
    )

    usePusherSubscription(
      'feed',
      PUSHER_EVENTS.POST_LIKED,
      useCallback((data: PostLikedPayload) => {
        setPosts((currentPosts) => {
          return currentPosts.map((post) => {
            if (post.id === data.postId) {
              return { ...post, likeCount: data.likeCount }
            }
            return post
          })
        })
      }, [])
    )

    usePusherSubscription(
      'feed',
      PUSHER_EVENTS.POST_REPOSTED,
      useCallback((data: PostRepostedPayload) => {
        // Update post repost count
        setPosts((currentPosts) => {
          return currentPosts.map((post) =>
            post.id === data.postId
              ? { ...post, repostCount: data.repostCount }
              : post
          )
        })

        // Check if repost is from someone we're following
        if (data.repostAuthor && followingIdsRef.current.has(data.repostAuthor.id)) {
          const reposter = {
            id: data.repostAuthor.id,
            name: data.repostAuthor.name,
            userId: data.repostAuthor.userId,
            avatarUrl: data.repostAuthor.avatarUrl || data.repostAuthor.image,
            image: data.repostAuthor.image,
          }

          setNewPostNotice((prev) => {
            if (!prev) {
              return {
                authors: [reposter],
                postId: data.postId,
              }
            }

            // Check if author already exists
            const existingIndex = prev.authors.findIndex((a) => a.id === reposter.id)
            if (existingIndex !== -1) {
              // Move to front
              const updatedAuthors = [
                reposter,
                ...prev.authors.filter((a) => a.id !== reposter.id),
              ].slice(0, 3)
              return {
                authors: updatedAuthors,
                postId: data.postId,
              }
            }

            // Add new author, keep only first 3
            const updatedAuthors = [reposter, ...prev.authors].slice(0, 3)
            return {
              authors: updatedAuthors,
              postId: data.postId,
            }
          })
        }
      }, [])
    )

    usePusherSubscription(
      'feed',
      PUSHER_EVENTS.POST_REPLIED,
      useCallback((data: PostRepliedPayload) => {
        setPosts((currentPosts) => {
          return currentPosts.map((post) =>
            post.id === data.parentId
              ? { ...post, commentCount: data.commentCount }
              : post
          )
        })
      }, [])
    )

    // Expose refresh function to parent
    useImperativeHandle(ref, () => ({
      refresh: fetchPosts,
    }))

    // Also set ref if provided
    useEffect(() => {
      if (onRefreshRef) {
        onRefreshRef.current = fetchPosts
      }
    }, [onRefreshRef, fetchPosts])

    const handleRefresh = () => {
      fetchPosts()
    }

    const handlePostCreated = (post: Post) => {
      setPosts((currentPosts) => {
        if (currentPosts.some((existing) => existing.id === post.id)) {
          return currentPosts
        }
        return [post, ...currentPosts]
      })
    }

    const handleLike = async (postId: string) => {
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
        likeCount: wasLiked ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
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
        
        // Update with server response
        setPosts((currentPosts) => {
          const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
          if (currentPostIndex === -1) return currentPosts

          const finalPosts = [...currentPosts]
          finalPosts[currentPostIndex] = {
            ...currentPosts[currentPostIndex],
            liked: data.liked,
            likeCount: data.likeCount,
          }
          return finalPosts
        })
      } catch (error) {
        console.error('Error toggling like:', error)
        
        // Rollback on error
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
        repostCount: wasReposted ? Math.max(0, post.repostCount - 1) : post.repostCount + 1,
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

        // 如果是貼文被 repost，移到最上面
        setPosts((currentPosts) => {
          const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
          if (currentPostIndex === -1) return currentPosts

          const finalPosts = [...currentPosts]
          const repostedPost = {
            ...currentPosts[currentPostIndex],
            reposted: data.reposted,
            repostCount: data.repostCount,
          }
          
          // Remove from current position
          finalPosts.splice(currentPostIndex, 1)
          
          // If reposted, move to top; otherwise keep in place
          if (data.reposted) {
            return [repostedPost, ...finalPosts]
          } else {
            return finalPosts
          }
        })
      } catch (error) {
        console.error('Error toggling repost:', error)

        // Rollback on error
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

    const handleDelete = (postId: string) => {
      setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId))
    }


    const handleNewPostNoticeClick = () => {
      setNewPostNotice(null)
      // Scroll to top and refresh
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setIsScrolled(false)
      setTimeout(() => {
        fetchPosts()
      }, 300)
    }

    return (
      <div className="flex flex-col">
        {/* New Post Notice - Only show in Following tab and when scrolled */}
        {activeTab === 'following' && isScrolled && newPostNotice && newPostNotice.authors.length > 0 && (
          <div className="sticky top-0 z-20 flex justify-center pt-2 pb-1 px-4">
            <button
              onClick={handleNewPostNoticeClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            >
              {/* Up arrow icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              
              {/* Overlapping avatars */}
              <div className="flex -space-x-2">
                {newPostNotice.authors.slice(0, 3).map((author, index) => (
                  <div
                    key={author.id}
                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                    style={{ zIndex: 3 - index }}
                  >
                    {author.avatarUrl || author.image ? (
                      <img
                        src={author.avatarUrl || author.image || ''}
                        alt={author.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* "posted" text */}
              <span className="text-sm font-medium">posted</span>
            </button>
          </div>
        )}

        {/* Inline Composer */}
        <InlineComposer onPostCreated={handlePostCreated} />

        {/* Post List */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex flex-col">
              {/* Loading Skeleton */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-200 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
                      <div className="flex gap-8">
                        <div className="h-4 bg-gray-300 rounded w-12" />
                        <div className="h-4 bg-gray-300 rounded w-12" />
                        <div className="h-4 bg-gray-300 rounded w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              <p>
                {activeTab === 'following' 
                  ? "You're not following anyone yet. Follow people to see their posts here!"
                  : "No posts yet. Be the first to post!"}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                onComment={handleComment}
                onDelete={handleDelete}
                showRepostLabel={true}
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

