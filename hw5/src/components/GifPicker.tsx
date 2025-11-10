'use client'

import React, { useState, useEffect, useRef } from 'react'

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void
  onClose?: () => void
}

interface GiphyGif {
  id: string
  images: {
    fixed_height: {
      url: string
      width: string
      height: string
    }
    original: {
      url: string
      width: string
      height: string
    }
  }
  title: string
}

export default function GifPicker({ onGifSelect, onClose }: GifPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [gifs, setGifs] = useState<GiphyGif[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 使用 Giphy 的公開 API
  // 如果需要更多功能，可以申請 Giphy API key 並設置 NEXT_PUBLIC_GIPHY_API_KEY
  // 如果沒有 API key，使用 demo key（有限制）
  const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'demo'
  const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      fetchTrendingGifs()
    }
  }, [isOpen])

  const fetchTrendingGifs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/gifs?type=trending')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Giphy API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch trending GIFs`)
      }
      
      const data = await response.json()
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from Giphy API')
      }
      
      setGifs(data.data || [])
    } catch (err) {
      console.error('Error fetching trending GIFs:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load GIFs'
      setError(errorMessage)
      
      // 如果使用 demo key 失敗，提示用戶需要 API key
      if (!process.env.NEXT_PUBLIC_GIPHY_API_KEY || process.env.NEXT_PUBLIC_GIPHY_API_KEY === 'demo') {
        setError('GIF 功能需要 Giphy API key。請在 .env 文件中設置 NEXT_PUBLIC_GIPHY_API_KEY')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      fetchTrendingGifs()
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/gifs?type=search&q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Giphy API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to search GIFs`)
      }
      
      const data = await response.json()
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from Giphy API')
      }
      
      setGifs(data.data || [])
    } catch (err) {
      console.error('Error searching GIFs:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to search GIFs'
      setError(errorMessage)
      
      // 如果使用 demo key 失敗，提示用戶需要 API key
      if (!process.env.NEXT_PUBLIC_GIPHY_API_KEY || process.env.NEXT_PUBLIC_GIPHY_API_KEY === 'demo') {
        setError('GIF 功能需要 Giphy API key。請在 .env 文件中設置 NEXT_PUBLIC_GIPHY_API_KEY')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchGifs(searchQuery)
  }

  const handleGifSelect = (gif: GiphyGif) => {
    // 使用 original URL 以獲得最佳質量
    onGifSelect(gif.images.original.url)
    setIsOpen(false)
    onClose?.()
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-full text-blue-500 hover:bg-blue-50 transition-colors font-semibold text-sm"
        aria-label="Add GIF"
      >
        GIF
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search GIFs..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* GIF Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-gray-500">{error}</div>
            ) : gifs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No GIFs found</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => handleGifSelect(gif)}
                    className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={gif.images.fixed_height.url}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

