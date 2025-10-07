import { createContext, useContext, useState, ReactNode } from 'react'

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
  setMovies: (movies: Movie[]) => void
  setHalls: (halls: Hall[]) => void
  setScreenings: (screenings: Screening[]) => void
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
        setMovies,
        setHalls,
        setScreenings,
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

