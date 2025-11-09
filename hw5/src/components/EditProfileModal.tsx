'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { User } from '@/types/user'
import AvatarCoverUploader from './AvatarCoverUploader'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  user: User
  onSave: (name: string, bio: string | null, avatarUrl?: string | null, coverUrl?: string | null) => Promise<void>
}

export default function EditProfileModal({ open, onClose, user, onSave }: EditProfileModalProps) {
  const router = useRouter()
  const { update } = useSession()
  const [name, setName] = useState(user.name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null)
  const [coverUrl, setCoverUrl] = useState<string | null>(user.coverUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  // 當 user 或 open 改變時，更新表單值
  useEffect(() => {
    if (open) {
      setName(user.name || '')
      setBio(user.bio || '')
      setAvatarUrl(user.avatarUrl || null)
      setCoverUrl(user.coverUrl || null)
      setError(null)
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSave(name.trim(), bio.trim() || null, avatarUrl, coverUrl)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = async (url: string) => {
    setIsUploadingAvatar(true)
    
    try {
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: url || null }),
      })

      if (!response.ok) {
        throw new Error('Failed to update avatar')
      }

      const updatedUser = await response.json()
      setAvatarUrl(updatedUser.avatarUrl)
      
      // Update NextAuth session to sync across all components
      await update({
        avatarUrl: updatedUser.avatarUrl,
      })
      
      // Refresh server components to update old posts with new avatar
      router.refresh()
    } catch (error) {
      console.error('Error updating avatar:', error)
      alert('Failed to update avatar')
      setAvatarUrl(user.avatarUrl || null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleResetAvatar = async () => {
    if (!confirm('Reset to default avatar from your OAuth provider?')) {
      return
    }
    
    setIsUploadingAvatar(true)
    
    try {
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: null }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset avatar')
      }

      const updatedUser = await response.json()
      setAvatarUrl(null)
      
      await update({
        avatarUrl: null,
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error resetting avatar:', error)
      alert('Failed to reset avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCoverUpload = async (url: string) => {
    setIsUploadingCover(true)
    
    try {
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coverUrl: url || null }),
      })

      if (!response.ok) {
        throw new Error('Failed to update cover')
      }

      const updatedUser = await response.json()
      setCoverUrl(updatedUser.coverUrl)
    } catch (error) {
      console.error('Error updating cover:', error)
      alert('Failed to update cover')
      setCoverUrl(user.coverUrl || null)
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleCancel = () => {
    setName(user.name || '')
    setBio(user.bio || '')
    setError(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">Edit profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingAvatar || isUploadingCover}
            className="px-4 py-2 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isUploadingAvatar || isUploadingCover ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Cover Image */}
          <div className="relative h-48">
            <AvatarCoverUploader
              type="cover"
              existingUrl={coverUrl}
              onUpload={handleCoverUpload}
              disabled={isSubmitting || isUploadingCover}
              userId={user.id}
            />
          </div>

          {/* Profile Section */}
          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="flex flex-col items-start gap-3">
                <AvatarCoverUploader
                  type="avatar"
                  existingUrl={avatarUrl || user.image}
                  onUpload={handleAvatarUpload}
                  disabled={isSubmitting || isUploadingAvatar}
                  userId={user.id}
                />
                {avatarUrl && (
                  <button
                    onClick={handleResetAvatar}
                    disabled={isSubmitting || isUploadingAvatar}
                    className="px-4 py-2 text-sm rounded-full border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Reset to default avatar"
                  >
                    Reset to default
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {name.length}/50
                </p>
              </div>

              {/* Bio Input */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {bio.length}/160
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

