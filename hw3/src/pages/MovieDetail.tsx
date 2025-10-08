import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Languages, Film, Ticket, Check } from 'lucide-react'
import { useMovieContext, Screening } from '@/context/MovieContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { movies, screenings, halls, loading } = useMovieContext()
  
  // 選中的場次
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)

  // 找到對應的電影
  const movie = movies.find((m) => m.movie_id === id)

  // 找到這部電影的所有場次
  const movieScreenings = screenings.filter((s) => s.movie_id === id)

  // 按日期分組場次
  const screeningsByDate = movieScreenings.reduce((acc, screening) => {
    if (!acc[screening.date]) {
      acc[screening.date] = []
    }
    acc[screening.date].push(screening)
    return acc
  }, {} as Record<string, typeof screenings>)

  // 排序日期
  const sortedDates = Object.keys(screeningsByDate).sort()

  // 找到選中場次的影廳
  const selectedHall = selectedScreening
    ? halls.find((h) => h.hall_id === selectedScreening.hall_id)
    : null

  // 處理選擇座位
  const handleSelectSeats = () => {
    if (!selectedScreening || !movie || !selectedHall) return

    navigate(`/movie/${id}/select-seat`, {
      state: {
        screening: selectedScreening,
        movie: movie,
        hall: selectedHall,
      },
    })
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
    <div className="space-y-6 pb-24">
      {/* 返回按鈕 */}
      <Button variant="ghost" onClick={() => navigate('/movies')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回電影列表
      </Button>

      {/* 電影資訊 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* 海報 */}
        <div className="md:col-span-1">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg sticky top-20"
          />
        </div>

        {/* 電影詳細資訊 */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Badge variant="secondary">{movie.age_rating_tw}</Badge>
              <span>•</span>
              <span>{movie.year}</span>
            </div>
          </div>

          {/* 類型標籤 */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.split('|').map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>

          {/* 基本資訊 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4" />
              <span>{movie.runtime_min} 分鐘</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Languages className="h-4 w-4" />
              <span>{movie.audio_language}</span>
            </div>
          </div>

          {/* 劇情簡介 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">劇情簡介</h3>
            <p className="text-gray-700 leading-relaxed">{movie.synopsis}</p>
          </div>
        </div>
      </div>

      {/* 場次選擇 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h2 className="text-2xl font-bold">選擇場次</h2>
          </div>
          {selectedScreening && (
            <Button onClick={handleSelectSeats} size="lg">
              <Ticket className="mr-2 h-5 w-5" />
              選擇座位
            </Button>
          )}
        </div>

        {movieScreenings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              目前沒有可用場次
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const dayScreenings = screeningsByDate[date]
              return (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {new Date(date).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {dayScreenings.map((screening) => {
                        const hall = halls.find((h) => h.hall_id === screening.hall_id)
                        const isSelected = selectedScreening?.screening_id === screening.screening_id
                        
                        return (
                          <Card
                            key={screening.screening_id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'ring-2 ring-primary shadow-md' : ''
                            }`}
                            onClick={() => setSelectedScreening(screening)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-bold text-lg">
                                    {screening.start_time}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {screening.end_time} 結束
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    screening.format === 'IMAX'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {screening.format}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>📍 {hall?.hall_name || screening.hall_id}</p>
                                <p className="text-xs">
                                  🎧 {screening.audio_language} / {screening.subtitle_language}
                                </p>
                                <p className="font-semibold text-primary pt-1">
                                  NT$ {screening.price_TWD}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="mt-3 flex items-center text-primary text-sm font-medium">
                                  <Check className="h-4 w-4 mr-1" />
                                  已選擇
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* 底部固定選擇座位按鈕 */}
      {selectedScreening && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">已選場次</p>
                <p className="text-lg font-bold">
                  {selectedScreening.date} {selectedScreening.start_time}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedHall?.hall_name} • {selectedScreening.format}
                </p>
              </div>
              <Button onClick={handleSelectSeats} size="lg" className="px-8">
                <Ticket className="mr-2 h-5 w-5" />
                選擇座位
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

