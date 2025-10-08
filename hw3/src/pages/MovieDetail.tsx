import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Languages, Film } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { movies, screenings, halls, loading } = useMovieContext()

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
    <div className="space-y-6">
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
            className="w-full rounded-lg shadow-lg"
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

      {/* 場次資訊 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-2xl font-bold">場次時刻表</h2>
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayScreenings.map((screening) => {
                        const hall = halls.find((h) => h.hall_id === screening.hall_id)
                        return (
                          <Card
                            key={screening.screening_id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() =>
                              navigate(`/screening/${screening.screening_id}`)
                            }
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
                                <p>
                                  🎧 {screening.audio_language} / {screening.subtitle_language}
                                </p>
                                <p className="font-semibold text-primary pt-1">
                                  NT$ {screening.price_TWD}
                                </p>
                              </div>
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
    </div>
  )
}

