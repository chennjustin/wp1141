import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Languages, Film, ChevronLeft, ChevronRight } from 'lucide-react'
import RatingIcon from '@/components/common/RatingIcon'
import { useMovieContext } from '@/context/MovieContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import TagChip from '@/components/movies/TagChip'

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

    // 排序日期
    const sortedDates = Object.keys(grouped).sort()
    
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

  // 解析類型標籤
  const genres = useMemo(() => {
    if (!movie) return []
    return movie.genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
  }, [movie])

  // 橫向捲動日期標籤
  const scrollDates = (direction: 'left' | 'right') => {
    if (dateTabsRef.current) {
      const scrollAmount = 200
      dateTabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

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

  // 取得格式 Badge 樣式
  const getFormatVariant = (format: string) => {
    if (format === 'IMAX') return 'default'
    if (format === '3D') return 'secondary'
    return 'outline'
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
        <Button onClick={() => navigate('/movies')}>返回電影列表</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* 返回按鈕 */}
      <Button variant="ghost" onClick={() => navigate('/movies')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回電影列表
      </Button>

      {/* Header - 大圖視覺 + 資訊欄 */}
      <div className="relative rounded-lg overflow-hidden">
        {/* 背景：海報模糊鋪底 */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
          style={{ backgroundImage: `url(${movie.poster_url})` }}
        />
        
        {/* 前景內容 */}
        <div className="relative bg-white/90 backdrop-blur-sm">
          <div className="container mx-auto p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* 左側：大海報 */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full max-w-[280px] md:max-w-[360px] rounded-lg shadow-2xl"
                />
              </div>

              {/* 右側：資訊 */}
              <div className="flex-1 space-y-4">
                {/* 標題與分級 */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                    {movie.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <RatingIcon rating={movie.age_rating_tw} />
                    <span className="text-gray-600">{movie.year}</span>
                  </div>
                </div>

                {/* 類型標籤 */}
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, idx) => (
                    <TagChip key={idx}>{genre}</TagChip>
                  ))}
                </div>

                {/* 基本資訊 */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
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
                <div className="pt-2">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">劇情簡介</h3>
                  <p className="text-gray-700 leading-relaxed">{movie.synopsis}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 場次選擇區 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">選擇場次</h2>

        {dates.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            目前沒有可用場次
          </div>
        ) : (
          <>
            {/* 日期 Tab - 橫向捲動 */}
            <div className="relative bg-white rounded-lg border shadow-sm p-2">
              {/* 左箭頭 */}
              <button
                onClick={() => scrollDates('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1 shadow-md"
                aria-label="向左捲動"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              {/* 日期標籤 */}
              <div
                ref={dateTabsRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {dates.map((date) => {
                  const { monthDay, weekday, isToday } = formatDate(date)
                  const isSelected = date === selectedDate

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg text-center transition-all min-w-[80px] ${
                        isSelected
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{monthDay}</div>
                      <div className="text-xs mt-1">
                        {isToday ? '今天' : weekday}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* 右箭頭 */}
              <button
                onClick={() => scrollDates('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1 shadow-md"
                aria-label="向右捲動"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* 時間膠囊清單 */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              {currentScreenings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  此日期沒有可用場次
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {currentScreenings.map((screening) => {
                    const hall = halls.find((h) => h.hall_id === screening.hall_id)

                    return (
                      <button
                        key={screening.screening_id}
                        onClick={() => handleScreeningClick(screening.screening_id)}
                        className="group relative bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary/10 hover:to-primary/5 border border-gray-200 hover:border-primary rounded-lg p-4 text-left transition-all hover:shadow-md"
                      >
                        {/* 時間 */}
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {screening.start_time}
                        </div>

                        {/* 格式與廳別 */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getFormatVariant(screening.format)}>
                            {screening.format}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {hall?.hall_name || screening.hall_id}
                          </span>
                        </div>

                        {/* 語言 */}
                        <div className="text-xs text-gray-500 mb-2">
                          {screening.audio_language} / {screening.subtitle_language}
                        </div>

                        {/* 價格 */}
                        <div className="text-lg font-semibold text-primary">
                          NT$ {screening.price_TWD}
                        </div>

                        {/* Hover 提示 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">點擊選位 →</span>
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
  )
}
