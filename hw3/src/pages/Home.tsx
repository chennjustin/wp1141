import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import HeroBanner from '@/components/home/HeroBanner'
import { useMovieContext } from '@/context/MovieContext'
import { useModal } from '@/context/ModalContext'

export default function Home() {
  const { movies, loading } = useMovieContext()
  const { openUsageGuide } = useModal()
  const navigate = useNavigate()

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

  // 分類電影（簡單模擬：前半為熱映，後半為即將上映）
  const nowShowingMovies = movies.slice(0, Math.ceil(movies.length / 2))
  const comingSoonMovies = movies.slice(Math.ceil(movies.length / 2))

  return (
    <div className="relative bg-gray-50">
      {/* ============================================ */}
      {/*  🎬 Hero Banner - 電影院風格大屏展示區塊        */}
      {/* ============================================ */}
      <HeroBanner />

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

          {/* 電影卡片列表 */}
          <MovieSection movies={nowShowingMovies} loading={loading} />
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

            {/* 電影卡片列表 */}
            <MovieSection movies={comingSoonMovies} loading={loading} isComingSoon />
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

// 電影區塊組件
interface MovieSectionProps {
  movies: any[]
  loading: boolean
  isComingSoon?: boolean
}

function MovieSection({ movies, loading, isComingSoon = false }: MovieSectionProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="flex-shrink-0 w-48 h-72 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
        {movies.map((movie, index) => (
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
            <MovieCard movie={movie} isComingSoon={isComingSoon} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// 電影卡片組件
interface MovieCardProps {
  movie: any
  isComingSoon?: boolean
}

function MovieCard({ movie, isComingSoon = false }: MovieCardProps) {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03]">
      <div className="relative">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-80 sm:h-[22rem] object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* 即將上映標籤 */}
        {isComingSoon && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl px-3 py-1.5 text-xs font-bold animate-pulse rounded-full">
              即將上映
            </div>
          </div>
        )}
        
        {/* 底部漸層覆蓋 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        
        {/* 懸浮時的詳細資訊 */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <h3 className="text-white font-bold text-lg sm:text-xl line-clamp-2 mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {movie.title}
          </h3>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {movie.genres.split(',').slice(0, 2).map((genre: string, idx: number) => (
              <div 
                key={idx} 
                className="text-xs bg-white/20 text-white border border-white/30 backdrop-blur-sm px-2 py-1 rounded"
              >
                {genre.trim()}
              </div>
            ))}
          </div>
          <button 
            className={`w-full font-semibold shadow-lg text-xs py-2 rounded transition-all duration-300 ${
              isComingSoon 
                ? 'bg-white/15 hover:bg-white/25 text-white border-2 border-white/50 hover:border-white/80 backdrop-blur-sm'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-2 border-white/20'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/movie/${movie.movie_id}`)
            }}
          >
            {isComingSoon ? '了解更多' : '立即訂票'}
          </button>
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
  )
}