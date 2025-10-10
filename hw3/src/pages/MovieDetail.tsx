import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Languages, Film } from 'lucide-react'
import AgeRating from '@/components/common/AgeRating'
import { useMovieContext } from '@/context/MovieContext'

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { movies, screenings, halls, loading } = useMovieContext()
  const dateTabsRef = useRef<HTMLDivElement>(null)
  
  // 找到對應的電影
  const movie = movies.find((m) => m.movie_id === id)

  // 找到這部電影的所有場次並按日期分組
  const { dates, screeningsByDate } = useMemo(() => {
    const movieScreenings = screenings.filter((s) => s.movie_id === id)
    const grouped = movieScreenings.reduce((acc, screening) => {
      if (!acc[screening.date]) {
        acc[screening.date] = []
      }
      acc[screening.date].push(screening)
      return acc
    }, {} as Record<string, typeof screenings>)

    // 排序日期 - 確保正確的日期升序排列
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
    
    return {
      dates: sortedDates,
      screeningsByDate: grouped,
    }
  }, [screenings, id])

  // 選中的日期（預設今天或第一個可用日期）
  const today = new Date().toISOString().split('T')[0]
  const defaultDate = dates.includes(today) ? today : dates[0]
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate || '')

  // 當前日期的場次
  const currentScreenings = selectedDate ? screeningsByDate[selectedDate] || [] : []

  // 解析類型標籤，要把""字樣先移除
  const genres = useMemo(() => {
    if (!movie) return []
    return movie.genres
      .replace(/"/g, '')  // 移除所有引號
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
  }, [movie])


  // 格式化日期顯示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    return {
      monthDay: `${month}/${day}`,
      weekday: `週${weekday}`,
      isToday: dateStr === today,
    }
  }

  // 處理場次點擊 - 直接導向選位頁
  const handleScreeningClick = (screeningId: string) => {
    navigate(`/movie/${id}/select-seat?screening=${screeningId}`)
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">載入中...</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Film className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600">找不到電影</h2>
        <button 
          onClick={() => navigate('/movies')}
          className="bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 transition-colors"
        >
          返回電影列表
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* 返回按鈕 */}
        <button 
          onClick={() => navigate('/movies')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回電影列表
        </button>

        {/* 電影資訊卡 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左側：海報 */}
            <div className="flex-shrink-0 relative">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-64 lg:w-80 rounded-lg shadow-lg"
              />
              {/* 分級標籤 */}
              <AgeRating rating={movie.age_rating_tw} size="lg" position="bottom-right" />
            </div>

            {/* 右側：電影資訊 */}
            <div className="flex-1 flex flex-col">
              {/* 標題與年份 */}
              <div className="mb-4">
                <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight">
                  {movie.title}
                </h1>
                <p className="text-gray-500 italic text-lg mb-3">
                  {movie.title} {/* 這裡可以根據實際資料調整為英文片名 */}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-lg">{movie.year}</span>
                </div>
              </div>

              {/* 類型標籤 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-3 py-1 text-sm border border-gray-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* 基本資訊 */}
              <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{movie.runtime_min} 分鐘</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <span>{movie.audio_language}</span>
                </div>
              </div>

              {/* 劇情簡介 */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">劇情簡介</h3>
                <p className="text-gray-700 leading-relaxed max-w-2xl line-clamp-[6]">
                  {movie.synopsis}
                </p>
              </div>

              {/* 立即訂票按鈕 */}
              <div className="mt-8">
                <button
                  onClick={() => {
                    // 滾動到場次選擇區域
                    document.getElementById('screenings-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white px-8 py-3 font-semibold transition-all duration-200 hover:shadow-lg shadow-md"
                >
                  立即訂票
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 日期選擇列 */}
        <div id="screenings-section" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">選擇場次</h2>

          {dates.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
              目前沒有可用場次
            </div>
          ) : (
            <>
              {/* 日期選擇 - 橫向捲動 */}
              <div className="bg-white border border-gray-200 p-4">
                <div
                  ref={dateTabsRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {dates.map((date) => {
                    const { monthDay, weekday, isToday } = formatDate(date)
                    const isSelected = date === selectedDate

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 px-4 py-3 text-center transition-all min-w-[90px] ${
                          isToday
                            ? 'bg-gradient-to-r from-purple-700 to-purple-800 text-white'
                            : isSelected
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="text-lg font-bold">{monthDay}</div>
                        <div className="text-xs mt-1">
                          {isToday ? '今天' : weekday}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 場次列表 */}
              <div className="bg-white border border-gray-200 p-6">
                {currentScreenings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    此日期沒有可用場次
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentScreenings.map((screening) => {
                      const hall = halls.find((h) => h.hall_id === screening.hall_id)

                      return (
                        <button
                          key={screening.screening_id}
                          onClick={() => handleScreeningClick(screening.screening_id)}
                          className="group bg-white border border-gray-200 hover:border-purple-400 p-4 text-left transition-all duration-200 hover:shadow-md"
                        >
                          {/* 時間 */}
                          <div className="text-2xl font-bold text-gray-900 mb-3">
                            {screening.start_time}
                          </div>

                          {/* 影廳與格式 */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              {hall?.hall_name || screening.hall_id}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1">
                              {screening.format}
                            </span>
                          </div>

                          {/* 語言 */}
                          <div className="text-xs text-gray-500 mb-3">
                            {screening.audio_language} / {screening.subtitle_language}
                          </div>

                          {/* 票價 */}
                          <div className="text-lg font-semibold text-purple-600">
                            NT$ {screening.price_TWD}
                          </div>

                          {/* Hover 提示 */}
                          <div className="mt-3 text-xs text-gray-400 group-hover:text-purple-500 transition-colors">
                            點擊選位 →
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
          </>
        )}
      </div>

        {/* 隱藏 scrollbar 的 CSS */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  )
}
