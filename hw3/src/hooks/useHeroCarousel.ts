import { useState, useEffect, useCallback } from 'react'

interface UseHeroCarouselProps {
  items: any[]
  autoPlayInterval?: number
  maxItems?: number
}

export function useHeroCarousel({ 
  items, 
  autoPlayInterval = 5000, 
  maxItems = 5 
}: UseHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)
  const [progress, setProgress] = useState(0)

  // 自動播放邏輯
  useEffect(() => {
    if (isPaused || !items.length) return
    
    setProgress(0)
    const duration = autoPlayInterval
    const interval = 50
    const increment = (interval / duration) * 100
    
    let currentProgress = 0
    const progressTimer = setInterval(() => {
      currentProgress += increment
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(progressTimer)
      }
    }, interval)
    
    const slideTimer = setTimeout(() => {
      handleNext()
    }, duration)
    
    return () => {
      clearInterval(progressTimer)
      clearTimeout(slideTimer)
    }
  }, [currentIndex, isPaused, items.length, autoPlayInterval])

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, maxItems))
  }, [items.length, maxItems])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + Math.min(items.length, maxItems)) % Math.min(items.length, maxItems))
  }, [items.length, maxItems])

  const handleDotClick = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused)
  }, [isPaused])

  return {
    currentIndex,
    isPaused,
    direction,
    progress,
    currentItem: items[currentIndex],
    handleNext,
    handlePrev,
    handleDotClick,
    togglePause,
    setIsPaused
  }
}
