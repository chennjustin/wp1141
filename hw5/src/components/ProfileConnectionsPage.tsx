'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type RelationshipUser = {
  id: string
  userId: string | null
  name: string | null
  avatarUrl: string | null
  bio: string | null
  isSelf: boolean
  isFollowing: boolean
}

type TargetUser = {
  id: string
  userId: string | null
  name: string | null
  avatarUrl: string | null
  bio: string | null
}

interface ProfileConnectionsPageProps {
  targetUser: TargetUser
  followers: RelationshipUser[]
  following: RelationshipUser[]
  initialTab: 'followers' | 'following'
}

export default function ProfileConnectionsPage({
  targetUser,
  followers: initialFollowers,
  following: initialFollowing,
  initialTab,
}: ProfileConnectionsPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const viewerId = session?.user?.id ?? null

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const [followers, setFollowers] = useState(initialFollowers)
  const [following, setFollowing] = useState(initialFollowing)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  const changeTab = (tab: 'followers' | 'following') => {
    setActiveTab(tab)
    if (targetUser.userId) {
      const params = new URLSearchParams()
      params.set('tab', tab)
      router.replace(`/profile/${targetUser.userId}/connections?${params.toString()}`, { scroll: false })
    }
  }

  const displayedUsers = useMemo(
    () => (activeTab === 'followers' ? followers : following),
    [activeTab, followers, following]
  )

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    if (targetUser.userId) {
      router.push(`/profile/${targetUser.userId}`)
    } else {
      router.push('/home')
    }
  }

  const updateUserFollowState = (userId: string, isFollowing: boolean) => {
    const mapper = (users: RelationshipUser[]) =>
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              isFollowing,
            }
          : user
      )

    setFollowers((current) => mapper(current))
    setFollowing((current) => mapper(current))
  }

  const handleToggleFollow = async (userId: string) => {
    if (!userId || userId === viewerId) {
      return
    }

    const targetFromFollowers = followers.find((user) => user.id === userId)
    const targetFromFollowing = following.find((user) => user.id === userId)
    const previousState =
      targetFromFollowers?.isFollowing ?? targetFromFollowing?.isFollowing ?? false

    setPendingUserId(userId)
    updateUserFollowState(userId, !previousState)

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle follow')
      }

      const data = await response.json()
      const finalState = typeof data.following === 'boolean' ? data.following : !previousState
      updateUserFollowState(userId, finalState)
    } catch (error) {
      console.error('Error toggling follow:', error)
      updateUserFollowState(userId, previousState)
    } finally {
      setPendingUserId(null)
    }
  }

  const tabClass = (tab: 'followers' | 'following') =>
    `flex-1 px-4 py-4 text-center font-semibold transition-colors relative ${
      activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:bg-gray-50'
    }`

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{targetUser.name || targetUser.userId}</h2>
          {targetUser.userId && <p className="text-sm text-gray-500">@{targetUser.userId}</p>}
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={tabClass('followers')}
          onClick={() => changeTab('followers')}
        >
          Followers
          {activeTab === 'followers' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full transition-all" />
          )}
        </button>
        <button
          className={tabClass('following')}
          onClick={() => changeTab('following')}
        >
          Following
          {activeTab === 'following' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full transition-all" />
          )}
        </button>
      </div>

  <div className="flex-1">
      {displayedUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {activeTab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {displayedUsers.map((user) => {
            const handleLabel = user.name || user.userId || 'Unknown'
            const canFollow = !user.isSelf && viewerId !== null
            const isFollowing = user.isFollowing

            return (
              <li key={user.id} className="flex items-start gap-3 px-4 py-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={handleLabel}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => user.userId && router.push(`/profile/${user.userId}`)}
                      className="font-semibold text-gray-900 hover:underline text-left truncate"
                    >
                      {handleLabel}
                    </button>
                    {user.isSelf && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        You
                      </span>
                    )}
                    {!user.isSelf && isFollowing && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
                        Following
                      </span>
                    )}
                  </div>
                  {user.userId && <p className="text-sm text-gray-500">@{user.userId}</p>}
                  {user.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>}
                </div>
                {canFollow && (
                  <button
                    type="button"
                    onClick={() => handleToggleFollow(user.id)}
                    disabled={pendingUserId === user.id}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                      user.isFollowing
                        ? 'border-gray-300 text-gray-900 hover:bg-red-50 hover:text-red-500'
                        : 'border-transparent bg-gray-900 text-white hover:bg-black'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {pendingUserId === user.id
                      ? '...'
                      : user.isFollowing
                      ? 'Following'
                      : 'Follow'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      </div>
    </div>
  )
}


