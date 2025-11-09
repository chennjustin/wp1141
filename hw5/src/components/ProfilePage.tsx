'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PostCard from './PostCard'
import ReplyModal from './ReplyModal'
import EditProfileModal from './EditProfileModal'
import { User } from '@/types/user'
import { Post } from '@/types/post'
import { PUSHER_EVENTS, PostCreatedPayload, PostLikedPayload, PostRepostedPayload, PostRepliedPayload } from '@/lib/pusher/events'
import { usePusherSubscription } from '@/hooks/usePusherSubscription'

// RepliesTab component
function RepliesTab({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [replies, setReplies] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const router = useRouter()

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/user/${userId}/replies`)

        if (!response.ok) {
          throw new Error('Failed to fetch replies')
        }

        const data = await response.json()
        setReplies(data)
      } catch (err) {
        console.error('Error fetching replies:', err)
        setError(err instanceof Error ? err.message : 'Failed to load replies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReplies()
  }, [userId])

  const handleLike = async (postId: string) => {
    const replyIndex = replies.findIndex((p) => p.id === postId)
    if (replyIndex === -1) return

    const reply = replies[replyIndex]
    const wasLiked = reply.liked || false
    const previousLikeCount = reply.likeCount

    // Optimistic update
    const updatedReplies = [...replies]
    updatedReplies[replyIndex] = {
      ...reply,
      liked: !wasLiked,
      likeCount: wasLiked ? reply.likeCount - 1 : reply.likeCount + 1,
    }
    setReplies(updatedReplies)

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

      setReplies((currentReplies) => {
        const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
        if (currentReplyIndex === -1) return currentReplies

        const finalReplies = [...currentReplies]
        finalReplies[currentReplyIndex] = {
          ...currentReplies[currentReplyIndex],
          liked: data.liked,
          likeCount: data.likeCount,
        }
        return finalReplies
      })

      // Only remove from list if viewing own profile and unliked
      if (isSelf && !data.liked) {
        setReplies((currentReplies) => currentReplies.filter((p) => p.id !== postId))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      setReplies((currentReplies) => {
        const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
        if (currentReplyIndex === -1) return currentReplies

        const rollbackReplies = [...currentReplies]
        rollbackReplies[currentReplyIndex] = {
          ...currentReplies[currentReplyIndex],
          liked: wasLiked,
          likeCount: previousLikeCount,
        }
        return rollbackReplies
      })
    }
  }

  const handleRepost = async (postId: string) => {
    const replyIndex = replies.findIndex((p) => p.id === postId)
    if (replyIndex === -1) return

    const reply = replies[replyIndex]
    const wasReposted = reply.reposted || false
    const previousRepostCount = reply.repostCount

    // Optimistic update
    const updatedReplies = [...replies]
    updatedReplies[replyIndex] = {
      ...reply,
      reposted: !wasReposted,
      repostCount: wasReposted ? reply.repostCount - 1 : reply.repostCount + 1,
    }
    setReplies(updatedReplies)

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

      setReplies((currentReplies) => {
        const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
        if (currentReplyIndex === -1) return currentReplies

        const finalReplies = [...currentReplies]
        finalReplies[currentReplyIndex] = {
          ...currentReplies[currentReplyIndex],
          reposted: data.reposted,
          repostCount: data.repostCount,
        }
        return finalReplies
      })
    } catch (error) {
      console.error('Error toggling repost:', error)
      setReplies((currentReplies) => {
        const currentReplyIndex = currentReplies.findIndex((p) => p.id === postId)
        if (currentReplyIndex === -1) return currentReplies

        const rollbackReplies = [...currentReplies]
        rollbackReplies[currentReplyIndex] = {
          ...currentReplies[currentReplyIndex],
          reposted: wasReposted,
          repostCount: previousRepostCount,
        }
        return rollbackReplies
      })
    }
  }

  const handleComment = (postId: string) => {
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

  if (replies.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No replies yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {replies.map((reply) => (
        <PostCard
          key={reply.id}
          post={reply}
          onLike={handleLike}
          onRepost={handleRepost}
          onComment={handleComment}
        />
      ))}
    </div>
  )
}

// RepostsTab component
function RepostsTab({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [reposts, setReposts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const router = useRouter()

  useEffect(() => {
    const fetchReposts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/user/${userId}/reposts`)

        if (!response.ok) {
          throw new Error('Failed to fetch reposts')
        }

        const data = await response.json()
        setReposts(data)
      } catch (err) {
        console.error('Error fetching reposts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load reposts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReposts()
  }, [userId])

  const handleLike = async (postId: string) => {
    const repostIndex = reposts.findIndex((p) => p.id === postId)
    if (repostIndex === -1) return

    const repost = reposts[repostIndex]
    const wasLiked = repost.liked || false
    const previousLikeCount = repost.likeCount

    // Optimistic update
    const updatedReposts = [...reposts]
    updatedReposts[repostIndex] = {
      ...repost,
      liked: !wasLiked,
      likeCount: wasLiked ? repost.likeCount - 1 : repost.likeCount + 1,
    }
    setReposts(updatedReposts)

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

      setReposts((currentReposts) => {
        const currentRepostIndex = currentReposts.findIndex((p) => p.id === postId)
        if (currentRepostIndex === -1) return currentReposts

        const finalReposts = [...currentReposts]
        finalReposts[currentRepostIndex] = {
          ...currentReposts[currentRepostIndex],
          liked: data.liked,
          likeCount: data.likeCount,
        }
        return finalReposts
      })

      // 不移除項目，只有在刷新後才會移除
    } catch (error) {
      console.error('Error toggling like:', error)
      setReposts((currentReposts) => {
        const currentRepostIndex = currentReposts.findIndex((p) => p.id === postId)
        if (currentRepostIndex === -1) return currentReposts

        const rollbackReposts = [...currentReposts]
        rollbackReposts[currentRepostIndex] = {
          ...currentReposts[currentRepostIndex],
          liked: wasLiked,
          likeCount: previousLikeCount,
        }
        return rollbackReposts
      })
    }
  }

  const handleRepost = async (postId: string) => {
    const repostIndex = reposts.findIndex((p) => p.id === postId)
    if (repostIndex === -1) return

    const repost = reposts[repostIndex]
    const wasReposted = repost.reposted || false
    const previousRepostCount = repost.repostCount

    // Optimistic update
    const updatedReposts = [...reposts]
    updatedReposts[repostIndex] = {
      ...repost,
      reposted: !wasReposted,
      repostCount: wasReposted ? repost.repostCount - 1 : repost.repostCount + 1,
    }
    setReposts(updatedReposts)

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

      setReposts((currentReposts) => {
        const currentRepostIndex = currentReposts.findIndex((p) => p.id === postId)
        if (currentRepostIndex === -1) return currentReposts

        const finalReposts = [...currentReposts]
        finalReposts[currentRepostIndex] = {
          ...currentReposts[currentRepostIndex],
          reposted: data.reposted,
          repostCount: data.repostCount,
        }
        return finalReposts
      })

      // 不移除項目，只有在刷新後才會移除
    } catch (error) {
      console.error('Error toggling repost:', error)
      setReposts((currentReposts) => {
        const currentRepostIndex = currentReposts.findIndex((p) => p.id === postId)
        if (currentRepostIndex === -1) return currentReposts

        const rollbackReposts = [...currentReposts]
        rollbackReposts[currentRepostIndex] = {
          ...currentReposts[currentRepostIndex],
          reposted: wasReposted,
          repostCount: previousRepostCount,
        }
        return rollbackReposts
      })
    }
  }

  const handleComment = (postId: string) => {
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

  if (reposts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No reposts yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {reposts.map((repost) => (
        <PostCard
          key={repost.id}
          post={repost}
          onLike={handleLike}
          onRepost={handleRepost}
          onComment={handleComment}
          showRepostLabel={true}
        />
      ))}
    </div>
  )
}

// LikedPostsTab component
function LikedPostsTab({ userId, isSelf }: { userId: string; isSelf: boolean }) {
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

      // 不移除項目，只有在刷新後才會移除
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
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'reposts' | 'likes'>('posts')
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(user._count.followers)
  const [followingCount, setFollowingCount] = useState(user._count.following)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [replyTarget, setReplyTarget] = useState<Post | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User>(user)

  // 如果查看他人頁面且 activeTab 是 'likes'，則切換到 'posts'
  // 如果查看他人頁面且未追蹤，則切換到 'posts'（因為沒有 tabs）
  useEffect(() => {
    if (!isSelf && activeTab === 'likes') {
      setActiveTab('posts')
    }
    if (!isSelf && !isFollowing && activeTab !== 'posts') {
      setActiveTab('posts')
    }
  }, [isSelf, isFollowing, activeTab])

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    setCurrentUser(user)
    setFollowerCount(user._count.followers)
    setFollowingCount(user._count.following)
  }, [user])

  useEffect(() => {
    setIsFollowing(initialFollowing)
  }, [initialFollowing])

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

  const handleSaveProfile = async (
    name: string,
    bio: string | null,
    avatarUrl?: string | null,
    coverUrl?: string | null
  ) => {
    if (!currentUser) {
      throw new Error('User not found')
    }

    const updateData: any = { name, bio }
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl

    const response = await fetch(`/api/user/${currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }

    const updatedUser = await response.json()

    setCurrentUser((prev) => ({
      ...prev,
      ...updatedUser,
    }))
    setFollowerCount(updatedUser._count?.followers ?? followerCount)

    // 更新 NextAuth session
    await update({
      user: {
        ...(session?.user ?? {}),
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        coverUrl: updatedUser.coverUrl,
      },
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
  usePusherSubscription(
    'feed',
    PUSHER_EVENTS.POST_CREATED,
    useCallback((data: PostCreatedPayload) => {
      if (data.post.authorId !== user.id) {
        return
      }
      setPosts((currentPosts) => {
        if (currentPosts.some((post) => post.id === data.post.id)) {
          return currentPosts
        }
        const formattedPost: Post = {
          id: data.post.id,
          content: data.post.content,
          authorId: data.post.authorId,
          createdAt: data.post.createdAt,
          updatedAt: data.post.updatedAt,
          mediaUrl: (data.post as any).mediaUrl ?? null,
          mediaType: (data.post as any).mediaType ?? null,
          author: {
            ...data.post.author,
          },
          likeCount: data.post.likeCount,
          repostCount: data.post.repostCount,
          commentCount: data.post.commentCount,
          liked: false,
          reposted: false,
          repostedByMe: false,
        }
        return [formattedPost, ...currentPosts]
      })
    }, [user.id])
  )

  usePusherSubscription(
    'feed',
    PUSHER_EVENTS.POST_LIKED,
    useCallback((data: PostLikedPayload) => {
      setPosts((currentPosts) => {
        return currentPosts.map((post) => {
          if (post.id === data.postId && post.authorId === user.id) {
            return { ...post, likeCount: data.likeCount }
          }
          return post
        })
      })
    }, [user.id])
  )

  usePusherSubscription(
    'feed',
    PUSHER_EVENTS.POST_REPOSTED,
    useCallback((data: PostRepostedPayload) => {
      setPosts((currentPosts) => {
        return currentPosts.map((post) => {
          if (post.id === data.postId && post.authorId === user.id) {
            return { ...post, repostCount: data.repostCount }
          }
          return post
        })
      })
    }, [user.id])
  )

  usePusherSubscription(
    'feed',
    PUSHER_EVENTS.POST_REPLIED,
    useCallback((data: PostRepliedPayload) => {
      setPosts((currentPosts) => {
        return currentPosts.map((post) => {
          if (post.id === data.parentId && post.authorId === user.id) {
            return { ...post, commentCount: data.commentCount }
          }
          return post
        })
      })
    }, [user.id])
  )

  return (
    <div className="flex flex-col">
      {/* Cover Image */}
      <div
        className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 bg-cover bg-center"
        style={
          currentUser.coverUrl
            ? {
                backgroundImage: `url(${currentUser.coverUrl})`,
              }
            : {}
        }
      />

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-gray-200">
        {/* Avatar */}
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="flex-1">
            {currentUser.avatarUrl || currentUser.image ? (
              <img
                src={currentUser.avatarUrl || currentUser.image || ''}
                alt={currentUser.name || 'User'}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
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
            <button
              type="button"
              onClick={() => {
                if (currentUser.userId) {
                  router.push(`/profile/${currentUser.userId}/connections?tab=followers`)
                }
              }}
              className="inline-flex items-center gap-1 hover:underline focus:outline-none"
            >
              <span className="font-semibold text-gray-900">{followerCount}</span> Followers
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentUser.userId) {
                  router.push(`/profile/${currentUser.userId}/connections?tab=following`)
                }
              }}
              className="inline-flex items-center gap-1 hover:underline focus:outline-none"
            >
              <span className="font-semibold text-gray-900">{followingCount}</span> Following
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {(isSelf || isFollowing) && (
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
          {isSelf ? (
            <>
              <button
                onClick={() => setActiveTab('replies')}
                className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
                  activeTab === 'replies'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Replies
                {activeTab === 'replies' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reposts')}
                className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
                  activeTab === 'reposts'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Reposts
                {activeTab === 'reposts' && (
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
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('replies')}
                className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
                  activeTab === 'replies'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Replies
                {activeTab === 'replies' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reposts')}
                className={`flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
                  activeTab === 'reposts'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Reposts
                {activeTab === 'reposts' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="flex flex-col">
        {!isSelf && !isFollowing ? (
          <div className="p-8 text-center text-gray-500">
            <p>Follow this user to see their posts, replies, and reposts.</p>
          </div>
        ) : activeTab === 'posts' ? (
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
                onDelete={isSelf ? (postId) => {
                  setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId))
                } : undefined}
                showRepostLabel={true}
              />
            ))
          )
        ) : activeTab === 'replies' ? (
          <RepliesTab userId={user.id} isSelf={isSelf} />
        ) : activeTab === 'reposts' ? (
          <RepostsTab userId={user.id} isSelf={isSelf} />
        ) : (
          <LikedPostsTab userId={user.id} isSelf={isSelf} />
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

