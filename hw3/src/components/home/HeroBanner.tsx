import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovieContext } from '@/context/MovieContext'

export default function HeroBanner() {
  const { movies, loading } = useMovieContext()
  const navigate = useNavigate()

  // Hero 輪播狀態
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Hero 切換函數 - 需要在 useEffect 之前定義
  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }, [movies.length])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }, [movies.length])

  // Hero 自動輪播
  useEffect(() => {
    if (loading || movies.length === 0) return
    
    const duration = 6000 // 延長到6秒，更符合電影院節奏
    const slideTimer = setTimeout(() => {
      handleNext()
    }, duration)
    
    return () => {
      clearTimeout(slideTimer)
    }
  }, [currentIndex, loading, movies.length, handleNext])

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Hero 動畫變體 - 電影院風格慢速淡入
  const heroVariants = {
    enter: () => ({
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: () => ({
      opacity: 0,
      scale: 0.95,
    }),
  }

  const currentMovie = movies[currentIndex]

  // 滾動動畫
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  return (
    <motion.section 
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="relative w-full h-screen overflow-hidden"
    >
      {loading ? (
        // 載入中骨架屏
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Skeleton className="w-full h-full" />
        </div>
      ) : movies.length === 0 ? (
        // 無電影時的佔位
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <p className="text-white text-2xl">暫無電影資料</p>
        </div>
      ) : (
        <>
          {/* Hero 輪播內容 */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={heroVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                opacity: { duration: 1.2 },
                scale: { duration: 1.2 },
              }}
              className="absolute inset-0"
            >
              {/* 全螢幕背景海報 */}
              <div className="absolute inset-0">
                <motion.img
                  key={`img-${currentIndex}`}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 12, ease: 'easeOut' }}
                  src={currentMovie?.big_screen_photo_url}
                  alt={currentMovie?.title}
                  className="w-full h-full object-cover object-center"
                  style={{ objectPosition: 'center center' }}
                />
                 {/* 電影院放映廳氛圍層 */}
                 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
                 <div className="absolute inset-0 backdrop-blur-[0.5px]" />
                 {/* 放映廳光線效果 */}
                 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
              </div>

              {/* 電影資訊層 - 居中佈局 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-6xl mx-auto px-8 pt-20">
                  <div className="max-w-2xl">
                    {/* 電影標題 */}
                    <div className="mb-4">
                      {/* 中文標題 */}
                      <motion.h1
                        key={`title-${currentIndex}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 1.2, ease: 'easeOut' }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-2"
                        style={{
                          textShadow: '0 8px 32px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.9)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {currentMovie?.title}
                      </motion.h1>
                      
                      {/* 英文標題 */}
                      <motion.h2
                        key={`eng-title-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1.0, ease: 'easeOut' }}
                        className="text-xl sm:text-2xl lg:text-3xl font-light text-white/90 leading-tight"
                        style={{
                          textShadow: '0 4px 16px rgba(0,0,0,0.8)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {currentMovie?.eng_title}
                      </motion.h2>
                    </div>

                    {/* 年份、片長、評分 */}
                     <motion.div
                       key={`meta-${currentIndex}`}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.7, duration: 1.0, ease: 'easeOut' }}
                      className="flex items-center gap-4 text-white/95 text-base sm:text-lg font-medium mb-4"
                      style={{ textShadow: '0 4px 16px rgba(0,0,0,0.8)' }}
                    >
                      <span className="font-bold text-lg">{currentMovie?.year}</span>
                      <span className="text-white/60 text-lg">•</span>
                      <span className="text-base">{currentMovie?.runtime_min} 分鐘</span>
                      <span className="text-white/60 text-lg">•</span>
                      <div className="flex items-center gap-1 bg-yellow-500/30 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-400/40">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-100 font-bold text-sm">8.5</span>
                      </div>
                    </motion.div>

                    {/* 類型標籤 */}
                     <motion.div
                       key={`genres-${currentIndex}`}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.9, duration: 1.0, ease: 'easeOut' }}
                      className="flex flex-wrap gap-2 mb-6"
                    >
                      {currentMovie?.genres.split(',').map((genre: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-gray-200/20 hover:bg-gray-200/30 text-gray-300 border border-gray-400/40 backdrop-blur-sm px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full"
                          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                        >
                          {genre.trim().replace(/"/g, '')}
                        </Badge>
                      ))}
                    </motion.div>

                    {/* 電影簡介 */}
                       <motion.p
                       key={`synopsis-${currentIndex}`}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 1.0, duration: 1.0, ease: 'easeOut' }}
                      className="text-white/90 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl line-clamp-2"
                      style={{ 
                        textShadow: '0 4px 16px rgba(0,0,0,0.8)',
                        lineHeight: '1.6'
                      }}
                    >
                      {currentMovie?.synopsis}
                    </motion.p>

                     {/* 電影院風格按鈕 */}
                     <motion.div
                       key={`buttons-${currentIndex}`}
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 1.3, duration: 1.0, ease: 'easeOut' }}
                       className="flex gap-4"
                     >
                       {/* 立即訂票按鈕 - 戲院售票機風格 */}
                       <motion.button
                         onClick={() => navigate(`/movie/${currentMovie?.movie_id}`)}
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.98 }}
                         className="group relative px-6 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold text-base shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all duration-300 overflow-hidden border border-red-400/60 flex items-center"
                         style={{
                           background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                           boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                         }}
                       >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                         <Play className="h-4 w-4 fill-white mr-2" />
                         立即訂票
                       </motion.button>                       
                     </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 左箭頭 - 簡潔三角形 */}
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-all duration-300 z-20"
            aria-label="上一部電影"
          >
            <ChevronLeft className="h-8 w-8" />
          </motion.button>

          {/* 右箭頭 - 簡潔三角形 */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-all duration-300 z-20"
            aria-label="下一部電影"
          >
            <ChevronRight className="h-8 w-8" />
          </motion.button>


          {/* 電影院風格圓點指示器 */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {movies.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => handleDotClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`relative h-4 w-4 rounded-full transition-all duration-300 border ${
                  index === currentIndex
                    ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                    : 'bg-transparent border-white/40 hover:border-white/70 hover:bg-white/20'
                }`}
                aria-label={`跳到第 ${index + 1} 部電影`}
              />
            ))}
          </div>

        </>
      )}
    </motion.section>
  )
}
