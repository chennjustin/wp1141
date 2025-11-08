'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { usePostModal, DraftPayload } from './PostModalProvider'
import MediaUploader from './MediaUploader'
import { Draft } from '@/types/draft'

interface PostModalProps {
  onPostCreated?: () => void
}

const MAX_LENGTH = 280

const buildComposerActions = () => [
  {
    label: 'Add image or video',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16.5V7a2 2 0 012-2h12a2 2 0 012 2v9.5M4 16.5l3.5-3.5a1.414 1.414 0 012 0L12 15m8-1.5l-3.5-3.5a1.414 1.414 0 00-2 0L12 12"
        />
      </svg>
    ),
  },
  {
    label: 'Add GIF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h4v8H5zM13 8h6m-6 4h4m-4 4h6" />
      </svg>
    ),
  },
  {
    label: 'Create poll',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11h10M7 15h6M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Add emoji',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4a8 8 0 100 16 8 8 0 000-16zm-3 6h.01M15 10h.01M9 15s1.5 2 3 2 3-2 3-2"
        />
      </svg>
    ),
  },
  {
    label: 'Schedule post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V5m8 2V5m-9 4h10m-11 0a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2H6z"
        />
      </svg>
    ),
  },
  {
    label: 'Add location',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 2a7 7 0 00-7 7c0 4.418 7 11 7 11s7-6.582 7-11a7 7 0 00-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z"
        />
      </svg>
    ),
  },
]

const hasUnsavedChanges = (content: string, mediaUrl: string | null) =>
  (content && content.trim().length > 0) || Boolean(mediaUrl)

type DraftListItem = Draft

type DraftRequestPayload = DraftPayload & { content?: string | null }

export default function PostModal({ onPostCreated }: PostModalProps) {
  const { isOpen, closeModal, openModal, initialDraft, clearDraft } = usePostModal()
  const { data: session } = useSession()
  const router = useRouter()
  const currentUser = session?.user

  const actions = useMemo(buildComposerActions, [])

  const [draftId, setDraftId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false)
  const [isDraftsOpen, setIsDraftsOpen] = useState(false)
  const [drafts, setDrafts] = useState<DraftListItem[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [draftsError, setDraftsError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      resetState()
      return
    }

    if (initialDraft) {
      setDraftId(initialDraft.id ?? null)
      setContent(initialDraft.content ?? '')
      setMediaUrl(initialDraft.mediaUrl ?? null)
      setMediaType(initialDraft.mediaType ?? null)
    } else {
      setDraftId(null)
      setContent('')
      setMediaUrl(null)
      setMediaType(null)
    }
  }, [initialDraft, isOpen])

  const resetState = () => {
    setDraftId(null)
    setContent('')
    setMediaUrl(null)
    setMediaType(null)
    setIsSubmitting(false)
    setIsSavingDraft(false)
    setIsSavePromptOpen(false)
    clearDraft()
  }

  const finalizeClose = () => {
    resetState()
    closeModal()
  }

  const requestClose = () => {
    if (hasUnsavedChanges(content, mediaUrl)) {
      setIsSavePromptOpen(true)
    } else {
      finalizeClose()
    }
  }

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setMediaUrl(url || null)
    setMediaType(url ? type : null)
  }

  const handlePost = async () => {
    if (content.trim().length === 0 && !mediaUrl) return
    if (content.length > MAX_LENGTH) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      if (draftId) {
        try {
          await fetch(`/api/drafts/${draftId}`, {
            method: 'DELETE',
          })
        } catch (error) {
          console.error('Error deleting draft after posting:', error)
        }
      }

      finalizeClose()
      if (onPostCreated) {
        onPostCreated()
      }
      router.refresh()
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!hasUnsavedChanges(content, mediaUrl)) {
      setIsSavePromptOpen(false)
      finalizeClose()
      return
    }

    setIsSavingDraft(true)
    try {
      const payload: DraftRequestPayload = {
        id: draftId ?? undefined,
        content: content.trim(),
        mediaUrl,
        mediaType,
      }

      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      let result: any = null
      try {
        result = await response.clone().json()
      } catch (parseError) {
        const text = await response.text()
        result = text ? { error: text } : null
      }

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save draft')
      }

      setIsSavePromptOpen(false)
      finalizeClose()
    } catch (error) {
      console.error('Error saving draft:', error)
      alert(error instanceof Error ? error.message : 'Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleDiscardDraft = () => {
    setIsSavePromptOpen(false)
    finalizeClose()
  }

  const handleDiscardButton = () => {
    requestClose()
  }

  const fetchDrafts = async () => {
    try {
      setLoadingDrafts(true)
      setDraftsError(null)
      const response = await fetch('/api/drafts')
      if (!response.ok) {
        throw new Error('Failed to load drafts')
      }
      const data: DraftListItem[] = await response.json()
      setDrafts(data)
    } catch (error) {
      console.error('Error fetching drafts:', error)
      setDraftsError(error instanceof Error ? error.message : 'Failed to load drafts')
    } finally {
      setLoadingDrafts(false)
    }
  }

  useEffect(() => {
    if (isDraftsOpen) {
      fetchDrafts()
    }
  }, [isDraftsOpen])

  const handleSelectDraft = (draft: DraftListItem) => {
    setIsDraftsOpen(false)
    openModal({
      id: draft.id,
      content: draft.content ?? '',
      mediaUrl: draft.mediaUrl ?? null,
      mediaType: draft.mediaType ?? null,
    })
  }

  const handleDeleteDraft = async (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation()
    try {
      await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
      setDrafts((current) => current.filter((draft) => draft.id !== id))
      if (draftId === id) {
        setDraftId(null)
        setContent('')
        setMediaUrl(null)
        setMediaType(null)
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={requestClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={requestClose}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => setIsDraftsOpen(true)}
            className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
          >
            Drafts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {currentUser?.avatarUrl || currentUser?.image ? (
                <img
                  src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                  alt={currentUser?.name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What is happening?"
                className="w-full min-h-[200px] resize-none border-none outline-none text-lg placeholder-gray-500"
                maxLength={MAX_LENGTH}
              />

              <div className="flex items-center justify-between text-sm text-blue-500">
                <span>Everyone can reply</span>
              </div>

              {mediaUrl && (
                <div className="relative mt-4 rounded-2xl overflow-hidden">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} controls className="w-full max-h-96 object-cover" />
                  ) : (
                    <img src={mediaUrl} alt="Media preview" className="w-full max-h-96 object-cover" />
                  )}
                  {!isSubmitting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMediaUrl(null)
                        setMediaType(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      aria-label="Remove media"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-500">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {}}
                      title={action.label}
                      className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                      disabled={isSubmitting}
                    >
                      {action.icon}
                    </button>
                  ))}
                </div>
                <span
                  className={`text-sm ${
                    content.length > MAX_LENGTH * 0.9
                      ? content.length >= MAX_LENGTH
                        ? 'text-red-500'
                        : 'text-yellow-500'
                      : 'text-gray-500'
                  }`}
                >
                  {content.length}/{MAX_LENGTH}
                </span>
              </div>
              <div className="mt-3">
                <MediaUploader
                  type="post"
                  existingUrl={mediaUrl}
                  onUpload={handleMediaUpload}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleDiscardButton}
            className="px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handlePost}
            disabled={isSubmitting || (!hasUnsavedChanges(content, mediaUrl) && !draftId)}
            className="px-6 py-2 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {/* Save draft prompt */}
      {isSavePromptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Save post?</h2>
            <p className="text-sm text-gray-600 mb-6">
              You can save this to send later from your drafts.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveDraft}
                className="w-full rounded-full bg-gray-900 text-white py-2 font-semibold hover:bg-black transition-colors disabled:opacity-60"
                disabled={isSavingDraft}
              >
                {isSavingDraft ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={handleDiscardDraft}
                className="w-full rounded-full border border-gray-300 py-2 font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drafts modal */}
      {isDraftsOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40" onClick={() => setIsDraftsOpen(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Drafts</h2>
              <button
                onClick={() => setIsDraftsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close drafts"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loadingDrafts ? (
                <div className="p-6 text-center text-gray-500">Loading drafts…</div>
              ) : draftsError ? (
                <div className="p-6 text-center text-red-500">{draftsError}</div>
              ) : drafts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No drafts yet.</div>
              ) : (
                drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleSelectDraft(draft)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {draft.content && draft.content.trim().length > 0 ? draft.content : 'Untitled draft'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(draft.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(event) => handleDeleteDraft(event, draft.id)}
                      className="ml-3 px-3 py-1 text-xs font-semibold text-red-500 border border-red-200 rounded-full hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

