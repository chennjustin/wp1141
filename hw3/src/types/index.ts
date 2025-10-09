// 統一的類型定義

export interface Movie {
  movie_id: string
  title: string
  year: string
  genres: string
  runtime_min: string
  audio_language: string
  age_rating_tw: string
  poster_url: string
  big_screen_photo_url: string
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

// 組件 Props 類型
export interface MovieCardProps {
  movie: Movie
  isComingSoon?: boolean
}

export interface MovieSectionProps {
  movies: Movie[]
  loading: boolean
  isComingSoon?: boolean
}

export interface TagChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

// Hook 類型
export interface UseHeroCarouselProps {
  items: any[]
  autoPlayInterval?: number
  maxItems?: number
}

// 動畫相關類型
export interface AnimationVariants {
  initial: any
  animate: any
  exit?: any
}

export interface TransitionConfig {
  duration: number
  ease: string | number[]
}
