import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Volume2 } from 'lucide-react'
import { Movie } from '@/context/MovieContext'
import { Button } from '@/components/ui/button'
import AgeRating from '@/components/common/AgeRating'

interface MovieRowProps {
  movie: Movie
}

const MovieRow = ({ movie }: MovieRowProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 hover:scale-[1.01] hover:border-gray-400 hover:shadow-sm transition-all duration-200">
      {/* 左側海報 */}
      <div className="flex-shrink-0 w-full sm:w-36 lg:w-40">
        <div
          className="relative aspect-[2/3] overflow-hidden cursor-pointer"
          onClick={() => navigate(`/movie/${movie.movie_id}`)}
        >
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
          {/* 分級標籤 */}
          <AgeRating rating={movie.age_rating_tw} size="md" position="bottom-right" />
        </div>
      </div>

      {/* 右側資訊 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* 標題與資訊 */}
        <div className="space-y-3">
          {/* 中文片名 */}
          <h3
            className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => navigate(`/movie/${movie.movie_id}`)}
          >
            {movie.title}
          </h3>

          {/* 英文片名 */}
          <p className="text-gray-500 italic">
            {movie.title} {/* 這裡可以根據實際資料調整為英文片名 */}
          </p>

          {/* 電影資訊 */}
          <div className="text-gray-400 text-sm flex gap-3">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.runtime_min} 分鐘</span>
            <span>•</span>
            <span>{movie.audio_language}</span>
          </div>

          {/* 簡介 */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {movie.synopsis}
          </p>
        </div>

        {/* 底部按鈕 */}
        <div className="mt-4">
          <button
            onClick={() => navigate(`/movie/${movie.movie_id}`)}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2 font-semibold transition-all duration-200"
          >
            查看場次
          </button>
        </div>
      </div>
    </div>
  )
}

export default MovieRow

