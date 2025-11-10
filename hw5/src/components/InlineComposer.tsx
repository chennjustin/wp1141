'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types/post'
import MediaUploader from './MediaUploader'
import EmojiPicker from './EmojiPicker'
import { calculateEffectiveLength } from '@/lib/content-parser'
import HighlightedTextarea from './HighlightedTextarea'

const MAX_LENGTH = 280

type InlineComposerProps = {
  onPostCreated?: (post: Post) => void
}

type MentionSuggestion = {
  id: string
  userId: string
  name: string | null
  avatarUrl: string | null
  image: string | null
}

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

export default function InlineComposer({ onPostCreated }: InlineComposerProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const currentUser = session?.user

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)

  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 240)}px`
  }

  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current)
    }
  }, [])

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
        autoResize(textarea)
      }
    }, 0)
  }

  const resetComposer = () => {
    setContent('')
    setMediaUrl(null)
    setMediaType(null)
    setError(null)
    setMentionQuery(null)
    setMentionStartIndex(null)
    setSuggestions([])
    setShowSuggestions(false)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      autoResize(textareaRef.current)
    }
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

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    setContent(newValue)
    setError(null)

    if (textareaRef.current) {
      autoResize(textareaRef.current)
    }

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

  const handleSubmit = async () => {
    if (isSubmitting) return
    const trimmed = content.trim()
    if (trimmed.length === 0) {
      setError('內容不可為空')
      return
    }
    const effectiveLength = calculateEffectiveLength(trimmed)
    if (effectiveLength > MAX_LENGTH) {
      setError(`內容長度不可超過 ${MAX_LENGTH} 字元`)
      return
    }

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
        const errorResult = await response.json().catch(() => null)
        throw new Error(errorResult?.error || '發佈貼文失敗')
      }

      const createdPost: Post = await response.json()
      onPostCreated?.(createdPost)
      resetComposer()
      router.refresh()
      
      // Focus on textarea after posting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    } catch (submitError) {
      console.error('Error creating post:', submitError)
      setError(submitError instanceof Error ? submitError.message : '發佈貼文失敗')
    } finally {
      setIsSubmitting(false)
    }
  }

  const effectiveLength = calculateEffectiveLength(content)
  const remaining = MAX_LENGTH - effectiveLength
  const remainingClass =
    remaining < 0 ? 'text-red-500' : remaining <= 20 ? 'text-yellow-500' : 'text-gray-400'

  return (
    <div className="border-b border-gray-200 p-3 md:p-4 overflow-hidden">
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
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none text-base md:text-lg placeholder-gray-500"
              maxLength={MAX_LENGTH * 2}
              rows={3}
            />

            {showSuggestions && (isLoadingSuggestions || suggestions.length > 0) && (
              <div
                className="fixed z-[100] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                style={{
                  top: `${suggestionPosition.top}px`,
                  left: `${suggestionPosition.left}px`,
                  minWidth: '220px',
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
                <span className={`text-xs md:text-sm ${remainingClass}`}>{effectiveLength}/{MAX_LENGTH}</span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || content.trim().length === 0}
                  className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-500 text-white text-sm md:text-base font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[32px] md:h-[36px] flex items-center justify-center"
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
              <span className={`text-xs md:text-sm ${remainingClass}`}>{effectiveLength}/{MAX_LENGTH}</span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || content.trim().length === 0}
                className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-500 text-white text-sm md:text-base font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[32px] md:h-[36px] flex items-center justify-center"
              >
                {isSubmitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}
