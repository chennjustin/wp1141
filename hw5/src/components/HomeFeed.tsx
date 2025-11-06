'use client'

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import InlineComposer from './InlineComposer'
import PostCard from './PostCard'
import { Post } from '@/types/post'

interface HomeFeedProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>
}

const HomeFeed = forwardRef<{ refresh: () => void }, HomeFeedProps>(
  ({ onRefreshRef }, ref) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    const handleLike = (postId: string) => {
      console.log('Like:', postId)
      // TODO: Call API
    }

    const handleRepost = (postId: string) => {
      console.log('Repost:', postId)
      // TODO: Call API
    }

    const handleComment = (postId: string) => {
      console.log('Comment:', postId)
      // TODO: Open comment modal or navigate to post detail
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
              />
            ))
          )}
        </div>
      </div>
    )
  }
)

HomeFeed.displayName = 'HomeFeed'

export default HomeFeed

