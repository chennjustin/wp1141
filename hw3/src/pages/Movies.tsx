import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Film, ArrowUpDown } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import MovieRow from '@/components/movies/MovieRow'
// 移除視覺上的 tag，僅保留搜尋邏輯

export default function Movies() {
  const { movies, loading, error } = useMovieContext()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // 從 URL 讀取篩選條件
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular')

  // 更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedGenre) params.set('genre', selectedGenre)
    if (sortBy !== 'popular') params.set('sort', sortBy)
    setSearchParams(params, { replace: true })
  }, [searchQuery, selectedGenre, sortBy, setSearchParams])

  // 類型集合僅供搜尋，不再渲染 Chips
  const allGenres = useMemo(() => {
    const genresSet = new Set<string>()
    movies.forEach((movie) => {
      movie.genres
        .replace(/"/g, '')  // 移除所有引號
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
        .forEach((g) => genresSet.add(g))
    })
    return Array.from(genresSet).sort()
  }, [movies])

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

    // 類型篩選（不渲染 chips，仍支援 URL 參數）
    if (selectedGenre) {
      result = result.filter((movie) =>
        movie.genres.replace(/"/g, '').split(',').map((g) => g.trim()).includes(selectedGenre)
      )
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
  }, [movies, searchQuery, selectedGenre, sortBy])

  // 清除所有篩選
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGenre('')
    setSortBy('popular')
  }

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
        <Button onClick={() => window.location.reload()}>重新載入</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 標題 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">電影列表</h1>
        <p className="text-gray-600 mt-1">
          共 {filteredAndSortedMovies.length} 部電影
          {(searchQuery || selectedGenre) && ' 符合條件'}
        </p>
      </div>

      {/* Sticky 篩選列（移除可視 chips） */}
      <div className="sticky top-16 z-40 bg-white border rounded-lg shadow-sm p-4 space-y-3">
        {/* 搜尋框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋電影名稱、類型或年份..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 類型篩選：改為輸入提示方式（不渲染 chips） */}
        {allGenres.length > 0 && (
          <p className="text-xs text-gray-500">
            可搜尋類型：{allGenres.slice(0, 8).join('、')}
            {allGenres.length > 8 ? '…' : ''}
          </p>
        )}

        {/* 排序 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">排序</label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
            >
              熱門
            </Button>
            <Button
              variant={sortBy === 'year_desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('year_desc')}
            >
              最新上映
            </Button>
            <Button
              variant={sortBy === 'runtime_desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('runtime_desc')}
            >
              長片優先
            </Button>
            <Button
              variant={sortBy === 'runtime_asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('runtime_asc')}
            >
              短片優先
            </Button>
          </div>
        </div>

        {/* 清除所有篩選 */}
        {(searchQuery || selectedGenre || sortBy !== 'popular') && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
              清除所有篩選
            </Button>
          </div>
        )}
      </div>

      {/* 電影列表 */}
      {filteredAndSortedMovies.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white rounded-lg border">
          <Film className="h-16 w-16 mx-auto text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-600">找不到電影</h2>
          <p className="text-gray-500">
            {searchQuery || selectedGenre
              ? '沒有符合條件的電影，請調整篩選條件'
              : '目前沒有上映的電影'}
          </p>
          {(searchQuery || selectedGenre || sortBy !== 'popular') && (
            <Button variant="outline" onClick={clearFilters}>
              清除所有篩選
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y shadow-sm">
          {filteredAndSortedMovies.map((movie) => (
            <MovieRow key={movie.movie_id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}

