'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from './PostCard'
import { User } from '@/types/user'
import { Post } from '@/types/post'

interface ProfilePageProps {
  user: User
  posts: Post[]
  isOwnProfile: boolean
}

export default function ProfilePage({ user, posts: initialPosts, isOwnProfile }: ProfilePageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  const handleFollow = () => {
    console.log('Follow/Unfollow:', user.id)
    setIsFollowing(!isFollowing)
    // TODO: Call API
  }

  const handleEditProfile = () => {
    console.log('Edit profile')
    // TODO: Navigate to edit profile page or open modal
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
      
      // Update with server response (use current state)
      setPosts((currentPosts) => {
        const currentPostIndex = currentPosts.findIndex((p) => p.id === postId)
        if (currentPostIndex === -1) return currentPosts
        
        const currentPost = currentPosts[currentPostIndex]
        const finalPosts = [...currentPosts]
        finalPosts[currentPostIndex] = {
          ...currentPost,
          liked: data.liked,
          likeCount: data.liked
            ? currentPost.likeCount + 1
            : Math.max(0, currentPost.likeCount - 1),
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

  const handleRepost = (postId: string) => {
    console.log('Repost:', postId)
  }

  const handleComment = (postId: string) => {
    console.log('Comment:', postId)
  }

  return (
    <div className="flex flex-col">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500" />

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-gray-200">
        {/* Avatar */}
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="flex-1">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300" />
            )}
          </div>
          <div className="mt-20">
            {isOwnProfile ? (
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
                    ? 'border border-gray-300 hover:bg-gray-50'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name || 'Unknown'}</h1>
          {user.userId && <p className="text-gray-500 mb-3">@{user.userId}</p>}
          {user.bio && <p className="text-gray-900 mb-3">{user.bio}</p>}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              <span className="font-semibold text-gray-900">{user._count.following}</span> Following
            </span>
            <span>
              <span className="font-semibold text-gray-900">{user._count.followers}</span> Followers
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
              />
            ))
          )
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Likes tab - TODO: Implement liked posts</p>
          </div>
        )}
      </div>
    </div>
  )
}

