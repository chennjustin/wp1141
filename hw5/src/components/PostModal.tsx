'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { usePostModal, DraftPayload } from './PostModalProvider'
import MediaUploader from './MediaUploader'
import EmojiPicker from './EmojiPicker'
import { Draft } from '@/types/draft'
import { calculateEffectiveLength } from '@/lib/content-parser'
import HighlightedTextarea from './HighlightedTextarea'

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

    // Focus on textarea when modal opens
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 100)
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

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + emoji + content.slice(end)
    setContent(newContent)

    // Set cursor position after emoji
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + emoji.length
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      }
    }, 0)
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
    mirror.style.pointerEvents = 'none'
    mirror.style.overflow = 'hidden'
    mirror.style.width = `${textarea.clientWidth}px`

    const textareaRect = textarea.getBoundingClientRect()
    mirror.style.top = `${textareaRect.top + window.scrollY}px`
    mirror.style.left = `${textareaRect.left + window.scrollX}px`

    const selectionEnd = textarea.selectionStart ?? 0
    const value = textarea.value
    mirror.textContent = value.substring(0, selectionEnd)

    const span = document.createElement('span')
    span.textContent = value.substring(selectionEnd) || '\u200b'
    mirror.appendChild(span)
    document.body.appendChild(mirror)

    const spanRect = span.getBoundingClientRect()

    // Calculate position relative to viewport for fixed positioning
    const top = spanRect.top + parseFloat(style.lineHeight || '20')
    const left = spanRect.left

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
    const effectiveLength = calculateEffectiveLength(trimmed)
    if (effectiveLength > MAX_LENGTH) return

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:bg-black/50"
      onClick={requestClose}
    >
      <div
        className="relative bg-white rounded-none md:rounded-2xl w-full h-full md:w-full md:max-w-2xl md:max-h-[90vh] md:h-auto overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200">
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
            className="text-xs md:text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
          >
            Drafts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          <div className="flex gap-2 md:gap-4">
            <div className="flex-shrink-0">
              {currentUser?.avatarUrl || currentUser?.image ? (
                <img
                  src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                  alt={currentUser?.name || 'User'}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <div className="relative">
                <HighlightedTextarea
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
                  className="w-full min-h-[150px] md:min-h-[200px] resize-none border-none outline-none text-base md:text-lg placeholder-gray-500"
                  maxLength={MAX_LENGTH * 2}
                />

                {showSuggestions && (isLoadingSuggestions || suggestions.length > 0) && (
                  <div
                    className="fixed z-[100] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                    style={{
                      top: `${suggestionPosition.top}px`,
                      left: `${suggestionPosition.left}px`,
                      minWidth: '240px',
                      maxWidth: '100%',
                    }}
                  >
                    {isLoadingSuggestions ? (
                      <div className="p-3 text-sm text-gray-500">載入中…</div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">沒有符合的使用者</div>
                    ) : (
                      <ul className={suggestions.length > 3 ? 'max-h-[180px] overflow-y-auto' : ''}>
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

              <div className="mt-3 md:mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 md:gap-2">
                  <MediaUploader
                    type="post"
                    existingUrl={mediaUrl}
                    onUpload={handleMediaUpload}
                    disabled={isSubmitting}
                  />
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  {/* GIF placeholder with tooltip */}
                  <div className="relative group">
                    <div className="p-1.5 md:p-2 rounded-full text-blue-500 opacity-50 cursor-not-allowed h-[32px] md:h-[36px] flex items-center justify-center">
                      <span className="text-xs md:text-sm font-semibold">GIF</span>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 md:px-3 py-1 md:py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      (來不及設定Giphy API key)
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                {!mediaUrl && (
                  <div className="flex items-center gap-2 md:gap-3">
                    {(() => {
                      const effectiveLength = calculateEffectiveLength(content)
                      const remaining = MAX_LENGTH - effectiveLength
                      const remainingClass =
                        remaining < 0
                          ? 'text-red-500'
                          : remaining <= MAX_LENGTH * 0.1
                            ? 'text-yellow-500'
                            : 'text-gray-500'
                      return (
                        <span className={`text-xs md:text-sm ${remainingClass}`}>
                          {effectiveLength}/{MAX_LENGTH}
                        </span>
                      )
                    })()}
                    <button
                      onClick={handleDiscardButton}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handlePost}
                      disabled={isSubmitting || (!hasUnsavedChanges(content, mediaUrl) && !draftId)}
                      className="px-4 md:px-6 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[32px] md:h-[36px] flex items-center justify-center"
                    >
                      {isSubmitting ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                )}
              </div>

              {/* Media Preview */}
              {mediaUrl && (
                <div className="mt-4 relative rounded-2xl overflow-hidden">
                  {mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full max-h-96 object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Media preview"
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                  {!isSubmitting && (
                    <button
                      onClick={() => {
                        setMediaUrl(null)
                        setMediaType(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
                      aria-label="Remove media"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Character count and Post button - below image if media exists */}
              {mediaUrl && (
                <div className="mt-4 flex items-center justify-between">
                  {(() => {
                    const effectiveLength = calculateEffectiveLength(content)
                    const remaining = MAX_LENGTH - effectiveLength
                    const remainingClass =
                      remaining < 0
                        ? 'text-red-500'
                        : remaining <= MAX_LENGTH * 0.1
                          ? 'text-yellow-500'
                          : 'text-gray-500'
                    return (
                      <span className={`text-xs md:text-sm ${remainingClass}`}>
                        {effectiveLength}/{MAX_LENGTH}
                      </span>
                    )
                  })()}
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      onClick={handleDiscardButton}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handlePost}
                      disabled={isSubmitting || (!hasUnsavedChanges(content, mediaUrl) && !draftId)}
                      className="px-4 md:px-6 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[32px] md:h-[36px] flex items-center justify-center"
                    >
                      {isSubmitting ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

