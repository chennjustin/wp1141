import Link from 'next/link'
import React from 'react'

/**
 * URL 正則表達式 - 匹配 http/https/ftp 開頭的 URL
 */
const URL_REGEX = /(https?:\/\/[^\s]+|ftp:\/\/[^\s]+)/gi

/**
 * Hashtag 正則表達式
 */
const HASHTAG_REGEX = /#([A-Za-z0-9_]+)/g

/**
 * Mention 正則表達式
 */
const MENTION_REGEX = /@([A-Za-z0-9_]+)/g

/**
 * 計算有效字元數
 * - 連結：每個連結佔用 23 字元（不管實際長度）
 * - Hashtag 和 Mention：不計入字元數
 * - 其他文字：正常計算
 */
export function calculateEffectiveLength(text: string): number {
  if (!text) return 0
  
  let length = text.length
  const processedIndices = new Set<number>()
  
  // 找出所有連結
  let urlMatch
  const urlRegex = new RegExp(URL_REGEX.source, URL_REGEX.flags)
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    const urlStart = urlMatch.index
    const urlEnd = urlStart + urlMatch[0].length
    // 標記這個範圍已被處理
    for (let i = urlStart; i < urlEnd; i++) {
      processedIndices.add(i)
    }
    // 移除連結的原始長度，加上 23 字元
    length = length - urlMatch[0].length + 23
  }
  
  // 找出所有 hashtag（排除已被連結處理的部分）
  let hashtagMatch
  const hashtagRegex = new RegExp(HASHTAG_REGEX.source, HASHTAG_REGEX.flags)
  while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
    const hashtagStart = hashtagMatch.index
    const hashtagEnd = hashtagStart + hashtagMatch[0].length
    // 檢查是否與連結重疊
    let isOverlapping = false
    for (let i = hashtagStart; i < hashtagEnd; i++) {
      if (processedIndices.has(i)) {
        isOverlapping = true
        break
      }
    }
    if (!isOverlapping) {
      // 標記這個範圍已被處理
      for (let i = hashtagStart; i < hashtagEnd; i++) {
        processedIndices.add(i)
      }
      // 移除 hashtag 的長度
      length -= hashtagMatch[0].length
    }
  }
  
  // 找出所有 mention（排除已被連結或 hashtag 處理的部分）
  let mentionMatch
  const mentionRegex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags)
  while ((mentionMatch = mentionRegex.exec(text)) !== null) {
    const mentionStart = mentionMatch.index
    const mentionEnd = mentionStart + mentionMatch[0].length
    // 檢查是否與連結或 hashtag 重疊
    let isOverlapping = false
    for (let i = mentionStart; i < mentionEnd; i++) {
      if (processedIndices.has(i)) {
        isOverlapping = true
        break
      }
    }
    if (!isOverlapping) {
      // 移除 mention 的長度
      length -= mentionMatch[0].length
    }
  }
  
  return length
}

/**
 * 解析文字內容，將連結、hashtag、mention 轉換為 React 元素
 */
export function parseContent(text: string): Array<string | JSX.Element> {
  const parts: Array<string | JSX.Element> = []
  let lastIndex = 0
  
  // 找出所有匹配項（連結、hashtag、mention）
  const matches: Array<{
    type: 'url' | 'hashtag' | 'mention'
    match: RegExpMatchArray
    index: number
  }> = []
  
  // 找出所有連結
  let urlMatch
  const urlRegex = new RegExp(URL_REGEX.source, URL_REGEX.flags)
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    matches.push({
      type: 'url',
      match: urlMatch,
      index: urlMatch.index,
    })
  }
  
  // 找出所有 hashtag
  let hashtagMatch
  const hashtagRegex = new RegExp(HASHTAG_REGEX.source, HASHTAG_REGEX.flags)
  while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
    matches.push({
      type: 'hashtag',
      match: hashtagMatch,
      index: hashtagMatch.index,
    })
  }
  
  // 找出所有 mention
  let mentionMatch
  const mentionRegex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags)
  while ((mentionMatch = mentionRegex.exec(text)) !== null) {
    matches.push({
      type: 'mention',
      match: mentionMatch,
      index: mentionMatch.index,
    })
  }
  
  // 按索引排序
  matches.sort((a, b) => a.index - b.index)
  
  // 處理重疊的匹配（優先順序：mention > hashtag > url）
  const processedMatches: typeof matches = []
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]
    let overlap = false
    
    for (let j = 0; j < processedMatches.length; j++) {
      const prev = processedMatches[j]
      const currentEnd = current.index + current.match[0].length
      const prevEnd = prev.index + prev.match[0].length
      
      // 檢查是否重疊
      if (
        (current.index >= prev.index && current.index < prevEnd) ||
        (prev.index >= current.index && prev.index < currentEnd)
      ) {
        // 如果重疊，保留優先順序高的（mention > hashtag > url）
        const priority = { mention: 3, hashtag: 2, url: 1 }
        if (priority[current.type] > priority[prev.type]) {
          processedMatches[j] = current
        }
        overlap = true
        break
      }
    }
    
    if (!overlap) {
      processedMatches.push(current)
    }
  }
  
  // 重新排序
  processedMatches.sort((a, b) => a.index - b.index)
  
  // 構建結果
  for (let i = 0; i < processedMatches.length; i++) {
    const match = processedMatches[i]
    const matchStart = match.index
    const matchEnd = matchStart + match.match[0].length
    
    // 添加匹配前的文字
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart))
    }
    
    // 添加匹配的元素
    const matchText = match.match[0]
    if (match.type === 'url') {
      parts.push(
        <a
          key={`url-${matchStart}`}
          href={matchText}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {matchText}
        </a>
      )
    } else if (match.type === 'hashtag') {
      parts.push(
        <span key={`hashtag-${matchStart}`} className="text-blue-500 hover:underline">
          {matchText}
        </span>
      )
    } else if (match.type === 'mention') {
      const handle = match.match[1]
      parts.push(
        <Link
          key={`mention-${matchStart}`}
          href={`/profile/${handle}`}
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {matchText}
        </Link>
      )
    }
    
    lastIndex = matchEnd
  }
  
  // 添加剩餘的文字
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  
  return parts.length > 0 ? parts : [text]
}

