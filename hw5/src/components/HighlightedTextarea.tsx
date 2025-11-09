'use client'

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { parseContent } from '@/lib/content-parser'

interface HighlightedTextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  maxLength?: number
  rows?: number
  disabled?: boolean
  autoFocus?: boolean
}

const HighlightedTextarea = forwardRef<HTMLTextAreaElement, HighlightedTextareaProps>(
  (
    {
      value,
      onChange,
      onClick,
      onKeyUp,
      onSelect,
      onKeyDown,
      placeholder,
      className = '',
      maxLength,
      rows = 3,
      disabled = false,
      autoFocus = false,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const overlayRef = useRef<HTMLDivElement | null>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Expose textarea ref to parent
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    // 同步 scroll 位置和高度
    const syncScroll = () => {
      if (textareaRef.current && overlayRef.current) {
        overlayRef.current.scrollTop = textareaRef.current.scrollTop
        overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
      }
    }

    useEffect(() => {
      syncScroll()
      // 同步高度
      if (textareaRef.current && overlayRef.current) {
        overlayRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [value])

    const handleScroll = () => {
      syncScroll()
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    // 計算 textarea 的樣式，用於 overlay
    const [textareaStyles, setTextareaStyles] = useState<React.CSSProperties>({})

    useEffect(() => {
      if (textareaRef.current) {
        const style = window.getComputedStyle(textareaRef.current)
        setTextareaStyles({
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform as React.CSSProperties['textTransform'],
          textAlign: style.textAlign as React.CSSProperties['textAlign'],
          paddingTop: style.paddingTop,
          paddingRight: style.paddingRight,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          borderTopWidth: style.borderTopWidth,
          borderRightWidth: style.borderRightWidth,
          borderBottomWidth: style.borderBottomWidth,
          borderLeftWidth: style.borderLeftWidth,
          lineHeight: style.lineHeight,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        })
      }
    }, [value, className])

    return (
      <div className="relative w-full">
        {/* Overlay for highlighting */}
        <div
          ref={overlayRef}
          className={`absolute inset-0 pointer-events-none ${className}`}
          style={{
            ...textareaStyles,
            zIndex: 1,
            overflow: 'hidden',
            height: 'auto',
            minHeight: '100%',
          }}
        >
          <div className="whitespace-pre-wrap break-words" style={{ minHeight: '100%' }}>
            {value ? parseContent(value) : null}
          </div>
        </div>

        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onClick={onClick}
          onKeyUp={onKeyUp}
          onSelect={onSelect}
          onKeyDown={onKeyDown}
          onScroll={handleScroll}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`relative z-10 bg-transparent ${className}`}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            caretColor: isFocused ? '#000000' : 'transparent', // 黑色游標
            color: value ? 'transparent' : 'inherit', // 有內容時透明，沒內容時顯示正常顏色（這樣 placeholder 才能顯示）
          }}
        />
      </div>
    )
  }
)

HighlightedTextarea.displayName = 'HighlightedTextarea'

export default HighlightedTextarea

