'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Post } from '@/types/post'
import { calculateEffectiveLength } from '@/lib/content-parser'
import HighlightedTextarea from './HighlightedTextarea'

interface ReplyModalProps {
  open: boolean
  onClose: () => void
  parentPost: Post | null
  onSubmit: (content: string) => Promise<void>
}

export default function ReplyModal({ open, onClose, parentPost, onSubmit }: ReplyModalProps) {
  const { data: session } = useSession()
  const currentUser = session?.user
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const maxLength = 280
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string
      userId: string
      name: string | null
      avatarUrl: string | null
      image: string | null
    }>
  >([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  useEffect(() => {
    if (!open) {
      setContent('')
      setIsSubmitting(false)
      setMentionQuery(null)
      setMentionStartIndex(null)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [open])

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
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Error fetching mention suggestions:', error)
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
  }

  const handleCaretUpdate = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement
    const cursor = target.selectionStart ?? content.length
    updateMentionState(target.value, cursor)
  }

  const handleMentionSelection = (suggestion: {
    id: string
    userId: string
    name: string | null
    avatarUrl: string | null
    image: string | null
  }) => {
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
    const trimmed = content.trim()
    if (trimmed.length === 0) {
      return
    }
    const effectiveLength = calculateEffectiveLength(trimmed)
    if (effectiveLength > maxLength) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setContent('')
      onClose()
    } catch (error) {
      console.error('Error submitting reply:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open || !parentPost) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Parent Post Preview */}
          {parentPost && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex gap-3">
                {parentPost.author?.profileImage || parentPost.author?.avatarUrl || parentPost.author?.image ? (
                  <img
                    src={
                      (parentPost.author?.profileImage ||
                        parentPost.author?.avatarUrl ||
                        parentPost.author?.image) || ''
                    }
                    alt={parentPost.author?.name || 'User'}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {parentPost.author?.name || 'Unknown'}
                    </span>
                    {parentPost.author?.userId && (
                      <span className="text-gray-500 text-sm">@{parentPost.author.userId}</span>
                    )}
                  </div>
                  <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
                    {parentPost.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reply Input */}
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {currentUser?.avatarUrl || currentUser?.image ? (
                <img
                  src={(currentUser?.avatarUrl || currentUser?.image) || ''}
                  alt={currentUser.name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300" />
              )}
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
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
                placeholder="Post your reply"
                className="w-full min-h-[150px] resize-none border-none outline-none text-lg placeholder-gray-500"
                maxLength={maxLength}
                autoFocus
              />
              {showSuggestions && (isLoadingSuggestions || suggestions.length > 0) && (
                <div
                  className="fixed bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-[100]"
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
              <div className="mt-4 flex items-center justify-between">
                {(() => {
                  const effectiveLength = calculateEffectiveLength(content)
                  const remaining = maxLength - effectiveLength
                  const remainingClass =
                    remaining < 0
                      ? 'text-red-500'
                      : remaining <= maxLength * 0.1
                        ? 'text-yellow-500'
                        : 'text-gray-500'
                  return (
                    <span className={`text-sm ${remainingClass}`}>
                      {effectiveLength}/{maxLength}
                    </span>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={content.trim().length === 0 || calculateEffectiveLength(content.trim()) > maxLength || isSubmitting}
            className="px-6 py-2 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

