import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loadCSV } from '@/utils/csvLoader'

export interface Movie {
  movie_id: string
  title: string
  year: string
  genres: string
  runtime_min: string
  audio_language: string
  age_rating_tw: string
  poster_url: string
  synopsis: string
}

export interface Hall {
  hall_id: string
  hall_name: string
  capacity: string
  seatmap_id: string
}

export interface Screening {
  screening_id: string
  date: string
  start_time: string
  end_time: string
  hall_id: string
  movie_id: string
  format: string
  audio_language: string
  subtitle_language: string
  price_TWD: string
}

export interface CartItem {
  id: string
  screening: Screening
  movie: Movie
  hall: Hall
  seats: string[]
}

interface MovieContextType {
  movies: Movie[]
  halls: Hall[]
  screenings: Screening[]
  cart: CartItem[]
  loading: boolean
  error: string | null
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const MovieContext = createContext<MovieContextType | undefined>(undefined)

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 載入所有 CSV 資料
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [moviesData, hallsData, screeningsData] = await Promise.all([
          loadCSV<Movie>('/data/movies.csv'),
          loadCSV<Hall>('/data/halls.csv'),
          loadCSV<Screening>('/data/screenings.csv'),
        ])

        setMovies(moviesData)
        setHalls(hallsData)
        setScreenings(screeningsData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('無法載入資料，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item])
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <MovieContext.Provider
      value={{
        movies,
        halls,
        screenings,
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </MovieContext.Provider>
  )
}

export function useMovieContext() {
  const context = useContext(MovieContext)
  if (!context) {
    throw new Error('useMovieContext must be used within MovieProvider')
  }
  return context
}

