import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const HeroCarousel = () => {
  const { movies, loading } = useMovieContext()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0) // 1 = next, -1 = prev

  // 自動播放邏輯
  useEffect(() => {
    if (isPaused || loading || movies.length === 0) return

    const timer = setInterval(() => {
      handleNext()
    }, 6000)

    return () => clearInterval(timer)
  }, [currentIndex, isPaused, loading, movies.length])

  // 鍵盤操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Enter' && movies.length > 0) {
        navigate(`/movie/${movies[currentIndex].movie_id}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, movies, navigate])

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }, [movies.length])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }, [movies.length])

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[420px] bg-gray-200 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="relative w-full h-[420px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-gray-500 text-lg">暫無電影資料</p>
      </div>
    )
  }

  const currentMovie = movies[currentIndex]

  // 動畫變體
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -40 : 40,
      opacity: 0,
    }),
  }

  return (
    <div
      className="relative w-full h-[280px] sm:h-[360px] lg:h-[420px] rounded-lg overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.55 },
          }}
          className="absolute inset-0"
        >
          {/* 背景圖片 */}
          <div className="absolute inset-0">
            <img
              src={currentMovie.poster_url}
              alt={currentMovie.title}
              className="w-full h-full object-cover"
            />
            {/* 漸層遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          {/* 內容區 */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              {/* 標題 */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                {currentMovie.title}
              </h2>

              {/* 類型標籤 */}
              <div className="flex flex-wrap gap-2">
                {currentMovie.genres.split(',').map((genre, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    {genre.trim()}
                  </Badge>
                ))}
              </div>

              {/* 年份與片長 */}
              <div className="flex items-center gap-4 text-white/90 text-sm sm:text-base">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentMovie.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{currentMovie.runtime_min} 分鐘</span>
                </div>
              </div>

              {/* 行動按鈕 */}
              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate(`/movie/${currentMovie.movie_id}`)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                >
                  查看場次
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 左箭頭 */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm z-10"
        aria-label="上一張"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* 右箭頭 */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm z-10"
        aria-label="下一張"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* 圓點導航 */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`跳到第 ${index + 1} 張`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel

