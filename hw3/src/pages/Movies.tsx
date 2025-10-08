import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Film } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export default function Movies() {
  const { movies, loading, error } = useMovieContext()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // 根據搜尋關鍵字篩選電影
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies

    const query = searchQuery.toLowerCase()
    return movies.filter((movie) => {
      const titleMatch = movie.title.toLowerCase().includes(query)
      const genresMatch = movie.genres.toLowerCase().includes(query)
      const yearMatch = movie.year.includes(query)
      return titleMatch || genresMatch || yearMatch
    })
  }, [movies, searchQuery])

  // 截斷文字函數
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Loading 狀態
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-96" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-64 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error 狀態
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Film className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600">載入失敗</h2>
        <p className="text-gray-500">{error}</p>
        <Button onClick={() => window.location.reload()}>重新載入</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 標題與搜尋列 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">電影列表</h1>
          <p className="text-gray-600 mt-1">
            共 {filteredMovies.length} 部電影
            {searchQuery && ` （搜尋：${searchQuery}）`}
          </p>
        </div>

        {/* 搜尋框 */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋電影名稱、類型或年份..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 電影清單 */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Film className="h-16 w-16 mx-auto text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-600">找不到電影</h2>
          <p className="text-gray-500">
            {searchQuery
              ? `沒有符合「${searchQuery}」的電影，請試試其他關鍵字`
              : '目前沒有上映的電影'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              清除搜尋
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Card
              key={movie.movie_id}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-72 object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                      {movie.age_rating_tw}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex-1 flex flex-col">
                <CardTitle className="mb-2 line-clamp-1" title={movie.title}>
                  {movie.title}
                </CardTitle>
                <CardDescription className="mb-3">
                  {movie.year} • {movie.runtime_min} 分鐘 • {movie.audio_language}
                </CardDescription>

                {/* 類型標籤 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {movie.genres.split('|').slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                  {movie.genres.split('|').length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{movie.genres.split('|').length - 3}
                    </Badge>
                  )}
                </div>

                {/* 簡介 */}
                <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                  {truncateText(movie.synopsis, 120)}
                </p>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/movie/${movie.movie_id}`)}
                >
                  查看場次
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

