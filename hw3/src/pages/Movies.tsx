import { useEffect } from 'react'
import Papa from 'papaparse'
import { useMovieContext } from '@/context/MovieContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Movies() {
  const { movies, setMovies } = useMovieContext()

  useEffect(() => {
    // 載入電影資料
    fetch('/data/movies.csv')
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setMovies(results.data as any)
          },
        })
      })
      .catch((error) => console.error('Error loading movies:', error))
  }, [setMovies])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">電影列表</h1>
        <p className="text-gray-600">共 {movies.length} 部電影</p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">載入中...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Card key={movie.movie_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2">{movie.title}</CardTitle>
                <CardDescription className="mb-3">
                  {movie.year} • {movie.runtime_min} 分鐘
                </CardDescription>
                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres.split('|').map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {movie.synopsis}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{movie.audio_language}</span>
                  <Badge variant="outline">{movie.age_rating_tw}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

