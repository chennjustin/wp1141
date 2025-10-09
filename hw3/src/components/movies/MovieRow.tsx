import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Volume2 } from 'lucide-react'
import { Movie } from '@/context/MovieContext'
import { Button } from '@/components/ui/button'
import RatingIcon from '@/components/common/RatingIcon'

interface MovieRowProps {
  movie: Movie
}

const MovieRow = ({ movie }: MovieRowProps) => {
  const navigate = useNavigate()

  // 不再顯示 tag，僅用於可選的內部搜尋，這裡不渲染
  // 移除標籤渲染

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-gray-50 transition-colors group">
      {/* 左側海報 */}
      <div className="flex-shrink-0 w-full sm:w-40 lg:w-48">
        <div
          className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md cursor-pointer group-hover:shadow-xl transition-shadow"
          onClick={() => navigate(`/movie/${movie.movie_id}`)}
        >
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 右側資訊 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* 標題與標籤 */}
        <div className="space-y-2">
          {/* 標題 */}
          <h3
            className="text-xl font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/movie/${movie.movie_id}`)}
          >
            {movie.title}
          </h3>

          {/* 分級 Icon */}
          <div className="flex items-center gap-2">
            <RatingIcon rating={movie.age_rating_tw} />
          </div>

          {/* 電影資訊 */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{movie.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{movie.runtime_min} 分鐘</span>
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span>{movie.audio_language}</span>
            </div>
          </div>

          {/* 簡介 - 2 行截斷 */}
          <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
            {movie.synopsis}
          </p>
        </div>

        {/* 底部按鈕 */}
        <div className="mt-3 flex items-center justify-between">
          <Button
            onClick={() => navigate(`/movie/${movie.movie_id}`)}
            variant="default"
            size="sm"
            className="group-hover:bg-primary group-hover:text-white transition-colors"
          >
            查看場次
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MovieRow

