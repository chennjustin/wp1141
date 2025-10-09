import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Info, Star, Pause, PlayIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovieContext } from '@/context/MovieContext'
import { useModal } from '@/context/ModalContext'

export default function Home() {
  const { movies, loading } = useMovieContext()
  const { openUsageGuide } = useModal()
  const navigate = useNavigate()

  // Hero 輪播狀態
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)
  const [progress, setProgress] = useState(0)

  // 滾動動畫
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  // 首次進站自動彈出使用教學
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('cbx_seen_guide')
    if (!hasSeenGuide) {
      const timer = setTimeout(() => {
        openUsageGuide()
        localStorage.setItem('cbx_seen_guide', '1')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [openUsageGuide])

  // Hero 自動輪播 + 進度條
  useEffect(() => {
    if (isPaused || loading || movies.length === 0) return
    
    setProgress(0)
    const duration = 5000
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
  }, [currentHeroIndex, isPaused, loading, movies.length])

  // Hero 切換函數
  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentHeroIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
  }, [movies.length])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentHeroIndex((prev) => (prev - 1 + Math.min(movies.length, 5)) % Math.min(movies.length, 5))
  }, [movies.length])

  const handleDotClick = (index: number) => {
    setDirection(index > currentHeroIndex ? 1 : -1)
    setCurrentHeroIndex(index)
  }

  // 分類電影（簡單模擬：前半為熱映，後半為即將上映）
  const nowShowingMovies = movies.slice(0, Math.ceil(movies.length / 2))
  const comingSoonMovies = movies.slice(Math.ceil(movies.length / 2))

  // Hero 動畫變體
  const heroVariants = {
    enter: () => ({
      opacity: 0,
      scale: 1.1,
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

  const currentMovie = movies[currentHeroIndex]

  return (
    <div className="relative bg-gray-50">
      {/* ============================================ */}
      {/*  1️⃣ Hero 區塊 - 佔滿螢幕寬、高約 80vh     */}
      {/* ============================================ */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative w-full h-[80vh] overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {loading ? (
          // 載入中骨架屏
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Skeleton className="w-full h-full" />
          </div>
        ) : movies.length === 0 ? (
          // 無電影時的佔位
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <p className="text-white text-2xl">暫無電影資料</p>
          </div>
        ) : (
          <>
            {/* Hero 輪播內容 */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentHeroIndex}
                custom={direction}
                variants={heroVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  opacity: { duration: 0.7 },
                  scale: { duration: 0.7 },
                }}
                className="absolute inset-0"
              >
                {/* 背景海報（帶模糊與漸層遮罩） */}
                <div className="absolute inset-0">
                  <motion.img
                    key={`img-${currentHeroIndex}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 8, ease: 'easeOut' }}
                    src={currentMovie?.poster_url}
                    alt={currentMovie?.title}
                    className="w-full h-full object-cover"
                  />
                  {/* 多層漸層遮罩：增強層次感 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                  {/* 底部額外加深遮罩（確保文字可讀性） */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                </div>

                {/* 浮出的半透明資訊層 */}
                <div className="absolute inset-0 flex items-end">
                  <div className="container mx-auto px-6 sm:px-8 lg:px-12 pb-20 sm:pb-24 lg:pb-32">
                    <div className="max-w-2xl space-y-4 sm:space-y-6">
                      {/* 標題 */}
                      <motion.div
                        key={`title-${currentHeroIndex}`}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight overflow-hidden"
                        style={{
                          textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)',
                          letterSpacing: '-0.02em',
                          marginTop: '2rem' // 增加上邊距避免被 navbar 擋住
                        }}
                      >
                        <div className="whitespace-nowrap animate-marquee">
                          {currentMovie?.title}
                        </div>
                      </motion.div>

                      {/* 年份、片長、評分 */}
                      <motion.div
                        key={`meta-${currentHeroIndex}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                        className="flex items-center gap-4 text-white/95 text-base sm:text-[1.2rem] font-medium"
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
                      >
                        <span className="font-semibold">{currentMovie?.year}</span>
                        <span className="text-white/60">•</span>
                        <span>{currentMovie?.runtime_min} 分鐘</span>
                        <span className="text-white/60">•</span>
                        <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-yellow-400/30">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-100 font-bold">8.5</span>
                        </div>
                      </motion.div>

                      {/* 類型標籤 */}
                      <motion.div
                        key={`genres-${currentHeroIndex}`}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.8, ease: 'easeOut' }}
                        className="flex flex-wrap gap-2.5 ml-20 mr-20" // 增加左右邊距避免被箭頭遮住
                      >
                        {currentMovie?.genres.split(',').map((genre, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-lg px-4 py-1.5 text-sm font-semibold transition-all duration-300 shadow-lg"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                          >
                            {genre.trim().replace(/"/g, '')} {/* 移除引號 */}
                          </Badge>
                        ))}
                      </motion.div>

                      {/* 簡介（選填，目前隱藏以簡化） */}
                      {/* <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-white/80 text-base sm:text-lg line-clamp-3"
                      >
                        {currentMovie?.synopsis}
                      </motion.p> */}

                      {/* 行動按鈕 */}
                      <motion.div
                        key={`buttons-${currentHeroIndex}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.85, duration: 0.8, ease: 'easeOut' }}
                        className="flex flex-wrap gap-4 pt-4"
                      >
                        <Button
                          size="lg"
                          onClick={() => navigate(`/movie/${currentMovie?.movie_id}`)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-2xl hover:shadow-red-500/50 gap-2.5 text-base sm:text-lg px-8 sm:px-10 py-6 font-bold transition-all duration-300 hover:scale-105 border-2 border-red-500/50"
                        >
                          <Play className="h-5 w-5 fill-white" />
                          立即訂票
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => navigate(`/movie/${currentMovie?.movie_id}`)}
                          className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 hover:border-white/80 backdrop-blur-lg shadow-xl gap-2.5 text-base sm:text-lg px-8 sm:px-10 py-6 font-semibold transition-all duration-300 hover:scale-105"
                        >
                          <Info className="h-5 w-5" />
                          更多資訊
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 左箭頭 */}
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 sm:p-4 transition-all duration-300 backdrop-blur-md z-10 border-2 border-white/20 hover:border-white/40 shadow-xl hover:shadow-white/30"
              style={{ boxShadow: '0 0 0 0 rgba(255,255,255,0)' }}
              aria-label="上一部電影"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.button>

            {/* 右箭頭 */}
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 sm:p-4 transition-all duration-300 backdrop-blur-md z-10 border-2 border-white/20 hover:border-white/40 shadow-xl hover:shadow-white/30"
              style={{ boxShadow: '0 0 0 0 rgba(255,255,255,0)' }}
              aria-label="下一部電影"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.button>

            {/* 自動播放進度條（底部） */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
              <motion.div
                key={`progress-${currentHeroIndex}`}
                className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/50"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* 圓點進度條 */}
            <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
              {movies.slice(0, 5).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative h-2.5 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentHeroIndex
                      ? 'bg-white w-10 sm:w-12 shadow-lg shadow-white/50'
                      : 'bg-white/40 hover:bg-white/70 w-2.5 sm:w-3'
                  }`}
                  aria-label={`跳到第 ${index + 1} 部電影`}
                >
                  {index === currentHeroIndex && (
                    <motion.div
                      className="absolute inset-0 bg-white rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* 暫停/播放按鈕 */}
            <motion.button
              onClick={() => setIsPaused(!isPaused)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-8 sm:bottom-12 right-6 sm:right-10 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full p-3 transition-all duration-300 z-10 border border-white/20 hover:border-white/40 shadow-xl"
              aria-label={isPaused ? '播放' : '暫停'}
            >
              {isPaused ? (
                <PlayIcon className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </motion.button>
          </>
        )}
      </motion.section>

      {/* ============================================ */}
      {/*  2️⃣ 本週熱映 區塊                          */}
      {/* ============================================ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="space-y-8 sm:space-y-10">
          {/* 區塊標題 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                本週熱映
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/movies')}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold text-base"
            >
              查看全部 →
            </Button>
          </motion.div>

          {/* 橫向滑動卡片容器 */}
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="flex-shrink-0 w-48 h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
                {nowShowingMovies.map((movie, index) => (
                  <motion.div
                    key={movie.movie_id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -10 }}
                    className="flex-shrink-0 w-52 sm:w-60 snap-start group cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.movie_id}`)}
                  >
                    {/* 電影卡片 */}
                    <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03]">
                      <div className="relative">
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-80 sm:h-[22rem] object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* 底部漸層覆蓋 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                        
                        {/* 懸浮時的詳細資訊 */}
                        <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                          <h3 className="text-white font-bold text-lg sm:text-xl line-clamp-2 mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                            {movie.title}
                          </h3>
                          <div className="flex gap-1.5 flex-wrap mb-3">
                            {movie.genres.split(',').slice(0, 2).map((genre, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                              >
                                {genre.trim()}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold border-2 border-white/20 shadow-lg text-xs py-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/movie/${movie.movie_id}`)
                            }}
                          >
                            立即訂票
                          </Button>
                        </div>

                        {/* 常駐底部資訊（非 hover 時顯示） */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent group-hover:opacity-0 transition-opacity duration-500">
                          <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                            {movie.title}
                          </h3>
                          <p className="text-white/80 text-xs mt-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                            {movie.year} • {movie.runtime_min} 分
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/*  3️⃣ 即將上映 區塊                          */}
      {/* ============================================ */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 lg:py-24 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-10">
            {/* 區塊標題 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                  即將上映
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/movies')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold text-base"
              >
                查看全部 →
              </Button>
            </motion.div>

            {/* 橫向滑動卡片容器 */}
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="flex-shrink-0 w-48 h-72 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
                  {comingSoonMovies.map((movie, index) => (
                    <motion.div
                      key={movie.movie_id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -10 }}
                      className="flex-shrink-0 w-52 sm:w-60 snap-start group cursor-pointer"
                      onClick={() => navigate(`/movie/${movie.movie_id}`)}
                    >
                      {/* 電影卡片 */}
                      <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03]">
                        <div className="relative">
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-full h-80 sm:h-[22rem] object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* 即將上映標籤 */}
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl px-3 py-1.5 text-xs font-bold animate-pulse">
                              即將上映
                            </Badge>
                          </div>
                          {/* 底部漸層覆蓋 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                          
                          {/* 懸浮時的詳細資訊 */}
                          <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                            <h3 className="text-white font-bold text-lg sm:text-xl line-clamp-2 mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                              {movie.title}
                            </h3>
                            <div className="flex gap-1.5 flex-wrap mb-3">
                              {movie.genres.split(',').slice(0, 2).map((genre, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="text-xs bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                                >
                                  {genre.trim()}
                                </Badge>
                              ))}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full bg-white/15 hover:bg-white/25 text-white border-2 border-white/50 hover:border-white/80 backdrop-blur-sm font-semibold shadow-lg text-xs py-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/movie/${movie.movie_id}`)
                              }}
                            >
                              了解更多
                            </Button>
                          </div>

                          {/* 常駐底部資訊（非 hover 時顯示） */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent group-hover:opacity-0 transition-opacity duration-500">
                            <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                              {movie.title}
                            </h3>
                            <p className="text-white/80 text-xs mt-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                              {movie.year} • {movie.runtime_min} 分
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/*  Footer 區塊                                */}
      {/* ============================================ */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12"
          >
            {/* 品牌區 */}
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Cinema Booking
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                提供最便捷的線上訂票服務，讓您輕鬆享受頂級觀影體驗。
              </p>
            </div>

            {/* 快速連結 */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">快速連結</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button onClick={() => navigate('/movies')} className="hover:text-white transition-colors duration-200">
                    電影列表
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/cart')} className="hover:text-white transition-colors duration-200">
                    購物車
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/history')} className="hover:text-white transition-colors duration-200">
                    訂票記錄
                  </button>
                </li>
                <li>
                  <button onClick={openUsageGuide} className="hover:text-white transition-colors duration-200">
                    使用教學
                  </button>
                </li>
              </ul>
            </div>

            {/* 聯絡資訊 */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">聯絡我們</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>客服專線：0800-123-456</li>
                <li>Email：service@cinema.com</li>
                <li className="flex gap-4 pt-2">
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    <span className="sr-only">YouTube</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* 版權聲明 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm"
          >
            <p>© 2024 Cinema Booking System. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>

      {/* 添加隱藏滾動條的樣式 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

