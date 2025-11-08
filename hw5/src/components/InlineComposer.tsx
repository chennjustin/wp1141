'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types/post'

const MAX_LENGTH = 280

type ComposerAction = {
  label: string
  icon: JSX.Element
}

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

const buildComposerActions = (): ComposerAction[] => [
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
  const actions = useMemo(() => buildComposerActions(), [])

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const resetComposer = () => {
    setContent('')
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
    if (trimmed.length > MAX_LENGTH) {
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
          mediaUrl: null,
          mediaType: null,
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
    } catch (submitError) {
      console.error('Error creating post:', submitError)
      setError(submitError instanceof Error ? submitError.message : '發佈貼文失敗')
    } finally {
      setIsSubmitting(false)
    }
  }

  const remaining = MAX_LENGTH - content.length
  const remainingClass =
    remaining < 0 ? 'text-red-500' : remaining <= 20 ? 'text-yellow-500' : 'text-gray-400'

  return (
    <div className="border-b border-gray-200 p-4">
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
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none text-lg placeholder-gray-500"
              maxLength={MAX_LENGTH * 2}
              rows={3}
            />

            {showSuggestions && (isLoadingSuggestions || suggestions.length > 0) && (
              <div
                className="absolute z-20 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                style={{
                  top: suggestionPosition.top,
                  left: suggestionPosition.left,
                  minWidth: '220px',
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

          <div className="mt-2 text-sm text-blue-500">Everyone can reply</div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-500">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  title={action.label}
                  className="p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                  disabled
                >
                  {action.icon}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-sm ${remainingClass}`}>{content.length}/{MAX_LENGTH}</span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || content.trim().length === 0}
                className="px-5 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}
