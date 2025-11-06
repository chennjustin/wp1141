'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import EditProfileModal from './EditProfileModal'
import { User } from '@/types/user'
import { Post } from '@/types/post'
import { pusherClient } from '@/lib/pusher/client'
import { PUSHER_EVENTS, PostLikedPayload, PostRepostedPayload, PostRepliedPayload } from '@/lib/pusher/events'
import Pusher from 'pusher-js'

// LikedPostsTab component
function LikedPostsTab({ userId }: { userId: string }) {
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/user/${userId}/likes`)

        if (!response.ok) {
          throw new Error('Failed to fetch liked posts')
        }

        const data = await response.json()
        setLikedPosts(data)
      } catch (err) {
        console.error('Error fetching liked posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load liked posts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLikedPosts()
  }, [userId])

  const handleLike = async (postId: string) => {
    const postIndex = likedPosts.findIndex((p) => p.id === postId)
    if (postIndex === -1) return

    const post = likedPosts[postIndex]
    const wasLiked = post.liked || false
    const previousLikeCount = post.likeCount

    // Optimistic update
    const updatedPosts = [...likedPosts]
    updatedPosts[postIndex] = {
      ...post,
      liked: !wasLiked,
      likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1,
    }
    setLikedPosts(updatedPosts)

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
      setLikedPosts((currentPosts) => {
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

      // If unliked, remove from list
      if (!data.liked) {
        setLikedPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Rollback
      setLikedPosts((currentPosts) => {
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
    const postIndex = likedPosts.findIndex((p) => p.id === postId)
    if (postIndex === -1) return

    const post = likedPosts[postIndex]
    const wasReposted = post.reposted || false
    const previousRepostCount = post.repostCount

    // Optimistic update
    const updatedPosts = [...likedPosts]
    updatedPosts[postIndex] = {
      ...post,
      reposted: !wasReposted,
      repostCount: wasReposted ? post.repostCount - 1 : post.repostCount + 1,
    }
    setLikedPosts(updatedPosts)

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
      setLikedPosts((currentPosts) => {
        const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
        if (currentPostIndex === -1) return currentPosts

        const finalPosts = [...currentPosts]
        finalPosts[currentPostIndex] = {
          ...currentPosts[currentPostIndex],
          reposted: data.reposted,
          repostCount: data.repostCount,
        }
        return finalPosts
      })
    } catch (error) {
      console.error('Error toggling repost:', error)
      // Rollback
      setLikedPosts((currentPosts) => {
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

  const router = useRouter()
  
  const handleComment = (postId: string) => {
    // Navigate to post detail page
    router.push(`/post/${postId}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
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
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (likedPosts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No liked posts yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {likedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onRepost={handleRepost}
          onComment={handleComment}
        />
      ))}
    </div>
  )
}

interface ProfilePageProps {
  user: User
  posts: Post[]
  isSelf: boolean
  isFollowing: boolean
}

export default function ProfilePage({ user, posts: initialPosts, isSelf, isFollowing: initialFollowing }: ProfilePageProps) {
  const router = useRouter()
  const { data: session, update } = useSession()
  const currentUserId = session?.user?.id
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts')
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(user._count.followers)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [replyTarget, setReplyTarget] = useState<Post | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User>(user)
  const pusherChannelRef = useRef<any>(null)

  const handleFollow = async () => {
    if (isSelf) return

    const wasFollowing = isFollowing
    const previousFollowerCount = followerCount

    // Optimistic update
    setIsFollowing(!wasFollowing)
    setFollowerCount(wasFollowing ? followerCount - 1 : followerCount + 1)

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle follow')
      }

      const data = await response.json()
      // Update following state from server; keep followerCount optimistic if API doesn't return it
      if (typeof data.following === 'boolean') {
        setIsFollowing(data.following)
      }
      if (typeof data.followerCount === 'number') {
        setFollowerCount(data.followerCount)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      // Rollback
      setIsFollowing(wasFollowing)
      setFollowerCount(previousFollowerCount)
    }
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = async (name: string, bio: string | null) => {
    if (!currentUser) {
      throw new Error('User not found')
    }

    const response = await fetch(`/api/user/${currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, bio }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }

    const updatedUser = await response.json()

    // 更新本地狀態
    setCurrentUser({
      ...currentUser,
      name: updatedUser.name,
      bio: updatedUser.bio,
    })

    // 更新 NextAuth session
    await update({
      ...session?.user,
      name: updatedUser.name,
      bio: updatedUser.bio,
    })

    // 重新載入頁面以確保所有資料同步
    router.refresh()
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

      // Success - refresh posts or show success message
      // For now, just close modal
      setReplyTarget(null)
    } catch (error) {
      console.error('Error posting reply:', error)
      throw error
    }
  }

  // Subscribe to Pusher events
  useEffect(() => {
    if (typeof window === 'undefined') return

    let pusher: Pusher | null = null
    try {
      pusher = pusherClient()
      const channel = pusher.subscribe('feed')

      pusherChannelRef.current = channel

      // Handle post liked - update if post belongs to this user
      channel.bind(PUSHER_EVENTS.POST_LIKED, (data: PostLikedPayload) => {
        setPosts((currentPosts) => {
          return currentPosts.map((post) => {
            // Only update if this post belongs to the profile user
            if (post.id === data.postId && post.authorId === user.id) {
              return { ...post, likeCount: data.likeCount }
            }
            return post
          })
        })
      })

      // Handle post reposted - update if post belongs to this user
      channel.bind(PUSHER_EVENTS.POST_REPOSTED, (data: PostRepostedPayload) => {
        setPosts((currentPosts) => {
          return currentPosts.map((post) => {
            // Only update if this post belongs to the profile user
            if (post.id === data.postId && post.authorId === user.id) {
              return { ...post, repostCount: data.repostCount }
            }
            return post
          })
        })
      })

      // Handle post replied - update if post belongs to this user
      channel.bind(PUSHER_EVENTS.POST_REPLIED, (data: PostRepliedPayload) => {
        setPosts((currentPosts) => {
          return currentPosts.map((post) => {
            // Only update if this post belongs to the profile user
            if (post.id === data.parentId && post.authorId === user.id) {
              return { ...post, commentCount: data.commentCount }
            }
            return post
          })
        })
      })
    } catch (error) {
      console.error('Error setting up Pusher subscription:', error)
    }

    // Cleanup
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
  }, [user.id])

  return (
    <div className="flex flex-col">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500" />

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-gray-200">
        {/* Avatar */}
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="flex-1">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name || 'User'}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300" />
            )}
          </div>
          <div className="mt-20">
            {isSelf ? (
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 rounded-full border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  isFollowing
                    ? 'border border-gray-300 bg-gray-100 text-gray-900 hover:text-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{currentUser.name || 'Unknown'}</h1>
          {currentUser.userId && <p className="text-gray-500 mb-3">@{currentUser.userId}</p>}
          {currentUser.bio && <p className="text-gray-900 mb-3 whitespace-pre-wrap">{currentUser.bio}</p>}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              <span className="font-semibold text-gray-900">{followerCount}</span> Followers
            </span>
            <span>
              <span className="font-semibold text-gray-900">{currentUser._count.following}</span> Following
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
            activeTab === 'posts'
              ? 'text-gray-900'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Posts
          {activeTab === 'posts' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
            activeTab === 'likes'
              ? 'text-gray-900'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Likes
          {activeTab === 'likes' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Posts List */}
      <div className="flex flex-col">
        {activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No posts yet.</p>
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
                showRepostLabel={true}
              />
            ))
          )
        ) : (
          <LikedPostsTab userId={user.id} />
        )}
      </div>

      {/* Reply Modal */}
      <ReplyModal
        open={replyTarget !== null}
        onClose={() => setReplyTarget(null)}
        parentPost={replyTarget}
        onSubmit={handleReplySubmit}
      />

      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={currentUser}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}

