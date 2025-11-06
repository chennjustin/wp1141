'use client'

import React from 'react'
import InlineComposer from './InlineComposer'
import PostCard from './PostCard'
import { getAllPosts } from '@/lib/mockData'

export default function HomeFeed() {
  const posts = getAllPosts()

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
        {posts.length === 0 ? (
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

