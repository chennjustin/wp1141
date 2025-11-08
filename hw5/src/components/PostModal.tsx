'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { usePostModal, DraftPayload } from './PostModalProvider'
import MediaUploader from './MediaUploader'
import { Draft } from '@/types/draft'

interface PostModalProps {
  onPostCreated?: () => void
}

const MAX_LENGTH = 280

type MentionSuggestion = {
  id: string
  userId: string
  name: string | null
  avatarUrl: string | null
  image: string | null
}

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

const extractMentionInfo = (value: string, cursorPosition: number) => {
  const uptoCursor = value.slice(0, cursorPosition)
  const mentionMatch = uptoCursor.match(/(^|\s)@([A-Za-z0-9_]{0,32})$/)
  if (!mentionMatch) {
    return null
  }

  const query = mentionMatch[2]
  const startIndex = cursorPosition - (query.length + 1)

  return {
    query,
    startIndex,
  }
}

export default function PostModal({ onPostCreated }: PostModalProps) {
  const { isOpen, closeModal, openModal, initialDraft, clearDraft } = usePostModal()
  const { data: session } = useSession()
  const router = useRouter()
  const currentUser = session?.user

  const actions = useMemo(buildComposerActions, [])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

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
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

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
    setMentionQuery(null)
    setMentionStartIndex(null)
    setSuggestions([])
    setShowSuggestions(false)
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

  const calculateSuggestionPosition = () => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    const style = window.getComputedStyle(textarea)
    const mirror = document.createElement('div')
    const properties = [
      'boxSizing',
      'width',
      'height',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'fontStyle',
      'letterSpacing',
      'textTransform',
      'textAlign',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'lineHeight',
    ]

    properties.forEach((prop) => {
      mirror.style.setProperty(prop, style.getPropertyValue(prop))
    })

    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.wordWrap = 'break-word'
    mirror.style.top = '0'
    mirror.style.left = '0'
    mirror.style.pointerEvents = 'none'
    mirror.style.overflow = 'hidden'
    mirror.style.width = `${textarea.clientWidth}px`

    const selectionEnd = textarea.selectionStart ?? 0
    const value = textarea.value
    mirror.textContent = value.substring(0, selectionEnd)

    const span = document.createElement('span')
    span.textContent = value.substring(selectionEnd) || '\u200b'
    mirror.appendChild(span)
    document.body.appendChild(mirror)

    const spanRect = span.getBoundingClientRect()
    const mirrorRect = mirror.getBoundingClientRect()

    const top =
      spanRect.top - mirrorRect.top + textarea.scrollTop + parseFloat(style.lineHeight || '20')
    const left = spanRect.left - mirrorRect.left + textarea.scrollLeft

    document.body.removeChild(mirror)

    setSuggestionPosition({
      top,
      left,
    })
  }

  const updateMentionState = (value: string, cursorPosition: number) => {
    const info = extractMentionInfo(value, cursorPosition)
    if (!info) {
      setMentionQuery(null)
      setMentionStartIndex(null)
      setShowSuggestions(false)
      return
    }

    setMentionQuery(info.query)
    setMentionStartIndex(info.startIndex)
    setShowSuggestions(true)
    calculateSuggestionPosition()
  }

  useEffect(() => {
    if (mentionQuery === null) {
      setSuggestions([])
      setIsLoadingSuggestions(false)
      return
    }

    const controller = new AbortController()
    const delay = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true)
        const response = await fetch(
          `/api/user/mention-suggestions?q=${encodeURIComponent(mentionQuery)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch mention suggestions')
        }

        const result = await response.json()
        setSuggestions(result.users || [])
      } catch (fetchError) {
        if ((fetchError as any)?.name !== 'AbortError') {
          console.error('Error fetching mention suggestions:', fetchError)
        }
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 200)

    return () => {
      controller.abort()
      clearTimeout(delay)
    }
  }, [mentionQuery])

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    setContent(newValue)

    const cursor = event.target.selectionStart ?? newValue.length
    updateMentionState(newValue, cursor)
    calculateSuggestionPosition()
  }

  const handleCaretUpdate = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement
    const cursor = target.selectionStart ?? content.length
    updateMentionState(target.value, cursor)
    calculateSuggestionPosition()
  }

  const handleMentionSelection = (suggestion: MentionSuggestion) => {
    if (mentionStartIndex === null) {
      return
    }

    const before = content.slice(0, mentionStartIndex)
    const queryLength = mentionQuery ? mentionQuery.length : 0
    const after = content.slice(mentionStartIndex + 1 + queryLength)
    const mentionText = `@${suggestion.userId}`
    const needsTrailingSpace = after.length === 0 || !/^\s/.test(after)
    const insertion = mentionText + (needsTrailingSpace ? ' ' : '')
    const newContent = `${before}${insertion}${after}`

    setContent(newContent)
    setShowSuggestions(false)
    setMentionQuery(null)
    setMentionStartIndex(null)

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newCursor = before.length + insertion.length
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursor, newCursor)
      }
    })
  }

  const handlePost = async () => {
    const trimmed = content.trim()
    if (trimmed.length === 0 && !mediaUrl) return
    if (trimmed.length > MAX_LENGTH) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmed,
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
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  onClick={handleCaretUpdate}
                  onKeyUp={handleCaretUpdate}
                  onSelect={handleCaretUpdate}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape' && showSuggestions) {
                      setShowSuggestions(false)
                      setMentionQuery(null)
                      setMentionStartIndex(null)
                    }
                  }}
                  placeholder="What is happening?"
                  className="w-full min-h-[200px] resize-none border-none outline-none text-lg placeholder-gray-500"
                  maxLength={MAX_LENGTH * 2}
                />

                {showSuggestions && (isLoadingSuggestions || suggestions.length > 0) && (
                  <div
                    className="absolute z-20 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                    style={{
                      top: suggestionPosition.top,
                      left: suggestionPosition.left,
                      minWidth: '240px',
                      maxWidth: '100%',
                    }}
                  >
                    {isLoadingSuggestions ? (
                      <div className="p-3 text-sm text-gray-500">載入中…</div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">沒有符合的使用者</div>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <li key={suggestion.id}>
                            <button
                              type="button"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                handleMentionSelection(suggestion)
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left"
                            >
                              {suggestion.avatarUrl || suggestion.image ? (
                                <img
                                  src={(suggestion.avatarUrl || suggestion.image) || ''}
                                  alt={suggestion.name || suggestion.userId}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                  {suggestion.name || suggestion.userId}
                                </span>
                                <span className="text-xs text-gray-500">@{suggestion.userId}</span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

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

