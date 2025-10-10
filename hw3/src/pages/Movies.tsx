import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Film } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import MovieRow from '@/components/movies/MovieRow'

export default function Movies() {
  const { movies, loading, error } = useMovieContext()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // 從 URL 讀取篩選條件
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular')

  // 更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (sortBy !== 'popular') params.set('sort', sortBy)
    setSearchParams(params, { replace: true })
  }, [searchQuery, sortBy, setSearchParams])


  // 篩選與排序電影
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies]

    // 關鍵字篩選
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((movie) => {
        const titleMatch = movie.title.toLowerCase().includes(query)
        const genresMatch = movie.genres.toLowerCase().includes(query)
        const yearMatch = movie.year.includes(query)
        return titleMatch || genresMatch || yearMatch
      })
    }


    // 排序
    switch (sortBy) {
      case 'year_desc':
        result.sort((a, b) => parseInt(b.year) - parseInt(a.year))
        break
      case 'year_asc':
        result.sort((a, b) => parseInt(a.year) - parseInt(b.year))
        break
      case 'runtime_desc':
        result.sort((a, b) => parseInt(b.runtime_min) - parseInt(a.runtime_min))
        break
      case 'runtime_asc':
        result.sort((a, b) => parseInt(a.runtime_min) - parseInt(b.runtime_min))
        break
      case 'popular':
      default:
        // 保持原始順序（熱門）
        break
    }

    return result
  }, [movies, searchQuery, sortBy])


  // Loading 狀態
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="h-48 w-40 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
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
        <button 
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          重新載入
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 標題 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">電影列表</h1>
          <p className="text-gray-600 mt-1">
            共 {filteredAndSortedMovies.length} 部電影
            {searchQuery && ' 符合條件'}
          </p>
        </div>

        {/* 搜尋列 */}
        <div className="sticky top-16 z-40 bg-gray-100/80 border border-gray-200 rounded-md p-4 focus-within:border-gray-400">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜尋電影、導演或年份..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-0 focus:ring-0 h-10"
            />
          </div>
        </div>

        {/* 排序列 */}
        <div className="bg-white border-b border-gray-200 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-600">
            共 {filteredAndSortedMovies.length} 部電影
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === 'popular' 
                  ? 'bg-purple-600 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              熱門
            </button>
            <button
              onClick={() => setSortBy('year_desc')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === 'year_desc' 
                  ? 'bg-purple-600 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              最新上映
            </button>
            <button
              onClick={() => setSortBy('runtime_desc')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === 'runtime_desc' 
                  ? 'bg-purple-600 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              片長優先
            </button>
          </div>
        </div>

        {/* 電影列表 */}
        {filteredAndSortedMovies.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-white rounded-md border border-gray-200">
            <Film className="h-16 w-16 mx-auto text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-600">找不到電影</h2>
            <p className="text-gray-500">
              {searchQuery
                ? '沒有符合條件的電影，請調整篩選條件'
                : '目前沒有上映的電影'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-200">
            {filteredAndSortedMovies.map((movie) => (
              <MovieRow key={movie.movie_id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

