import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { TrendingUp, Trophy, Medal, Ticket } from 'lucide-react'

interface MovieStats {
  movieId: string
  title: string
  posterUrl: string
  ticketCount: number
}

export default function PopularMovies() {
  const navigate = useNavigate()
  const [popularMovies, setPopularMovies] = useState<MovieStats[]>([])

  useEffect(() => {
    // 從 localStorage 讀取訂單並統計
    const savedOrders = localStorage.getItem('cinema_orders')
    if (!savedOrders) {
      setPopularMovies([])
      return
    }

    const orders = JSON.parse(savedOrders)
    const movieStats: Record<string, MovieStats> = {}

    // 統計每部電影的票數
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const movieId = item.movie.movie_id
        if (!movieStats[movieId]) {
          movieStats[movieId] = {
            movieId: movieId,
            title: item.movie.title,
            posterUrl: item.movie.poster_url,
            ticketCount: 0,
          }
        }
        movieStats[movieId].ticketCount += item.seats.length
      })
    })

    // 轉換為陣列並排序
    const sortedMovies = Object.values(movieStats)
      .sort((a, b) => b.ticketCount - a.ticketCount)
      .slice(0, 3) // 取前 3 名

    setPopularMovies(sortedMovies)
  }, [])

  if (popularMovies.length === 0) {
    return null
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 2:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white'
      default:
        return 'bg-gray-200'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-orange-600" />
          本週熱門電影
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {popularMovies.map((movie, index) => (
            <Card
              key={movie.movieId}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/movie/${movie.movieId}`)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${getRankBadge(index)}`}>
                      {getRankIcon(index)}
                      <span className="font-bold">No.{index + 1}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg line-clamp-1" title={movie.title}>
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">已售</span>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {movie.ticketCount} 張
                    </Badge>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((movie.ticketCount / popularMovies[0].ticketCount) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {popularMovies.length > 0 && (
          <p className="text-sm text-center text-gray-500 mt-4">
            ⭐ 統計數據基於實際訂票記錄
          </p>
        )}
      </CardContent>
    </Card>
  )
}

