import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import HeroBanner from '@/components/home/HeroBanner'
import { useMovieContext } from '@/context/MovieContext'
import { useModal } from '@/context/ModalContext'
import AgeRating from '@/components/common/AgeRating'

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

  return (
    <div className="relative bg-white">
      {/* ============================================ */}
      {/*  🎬 Hero Banner - 電影院風格大屏展示區塊        */}
      {/* ============================================ */}
      <HeroBanner />

      {/* ============================================ */}
      {/*  🎬 現正熱映 區塊 - 秀泰影城風格              */}
      {/* ============================================ */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="space-y-6 sm:space-y-8">
          {/* 區塊標題 - 秀泰影城風格 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3">
                🎬 現正熱映
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full" />
            </div>
            <button
              onClick={() => navigate('/movies')}
              className="bg-gray-800 text-white hover:bg-gray-900 px-6 py-3 font-semibold transition-colors duration-200 border border-gray-700 hover:border-gray-600"
            >
              查看所有電影 →
            </button>
          </motion.div>

          {/* 電影卡片網格 - 多行平鋪展示 */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 items-stretch">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.movie_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group w-full h-full"
                >
                  <ShowtimesMovieCard movie={movie} />
                </motion.div>
              ))}
            </div>
          )}
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
                CHCCCinema
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                提供最便捷的線上訂票服務，讓您輕鬆享受頂級觀影體驗。
              </p>
            </div>

            {/* 快速連結 */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">超連結</h4>
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
                <li>客服專線：02-3366-3366</li>
                <li>Email：service@chcccinema.com(沒這東西)</li>
                <li className="flex gap-4 pt-2">
                  <a href="https://www.facebook.com/ntuim/?locale=zh_TW" target="_blank" className="hover:text-white transition-colors duration-200">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/ntu_imnight/" target="_blank" className="hover:text-white transition-colors duration-200">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/watch?v=4H3b5wATFos&list=PLqwUtSomsxQD0XLDPtHKGKFSjH2D_cBG3" target="_blank" className="hover:text-white transition-colors duration-200">
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
            <p>© 2025 CHCCCinema. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

// 秀泰影城風格電影卡片組件
interface ShowtimesMovieCardProps {
  movie: any
}

function ShowtimesMovieCard({ movie }: ShowtimesMovieCardProps) {
  const navigate = useNavigate()

  // 模擬特殊場次標記（可以根據實際資料調整）
  const isSpecial = Math.random() > 0.8 // 20% 機率顯示特別場

  return (
    <div 
      className="bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden w-full h-full flex flex-col"
      onClick={() => navigate(`/movie/${movie.movie_id}`)}
    >
      {/* 電影海報 */}
      <div className="relative aspect-[2/3] bg-gray-200 w-full overflow-hidden flex-shrink-0">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
        
        {/* 特殊場次標記 */}
        {isSpecial && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 shadow-lg">
              特別場
            </div>
          </div>
        )}

        {/* 分級標籤 */}
        <AgeRating rating={movie.age_rating_tw} size="md" position="top-right" />
      </div>

      {/* 電影資訊 */}
      <div className="p-3 bg-white flex-1 flex flex-col min-h-[120px]">
        {/* 中文片名 */}
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-1">
          {movie.title || '電影標題'}
        </h3>

        {/* 英文片名 */}
        <p className="text-xs text-gray-500 italic line-clamp-1 mb-1">
          {movie.eng_title || 'Movie Title'}
        </p>

        {/* 上映日期 */}
        <p className="text-xs text-gray-400 mb-3">
          上映日期: {movie.year}/10/09 {/* 模擬上映日期 */}
        </p>

        {/* 線上訂票按鈕 */}
        <button 
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs font-semibold py-2 px-3 transition-all duration-200 hover:shadow-md mt-auto"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/movie/${movie.movie_id}`)
          }}
        >
          線上訂票
        </button>
      </div>
    </div>
  )
}