import { useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/feedback/Toaster'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Movie, Screening, Hall } from '@/context/MovieContext'

interface AddToCartToastParams {
  movie: Movie
  screening: Screening
  hall: Hall
  seats: string[]
}

export function useAddToCartToast() {
  const { addToast } = useToast()
  const navigate = useNavigate()

  const showAddToCartToast = ({
    movie,
    screening,
    hall,
    seats,
  }: AddToCartToastParams) => {
    const totalPrice = parseFloat(screening.price_TWD) * seats.length

    addToast({
      variant: 'success',
      duration: 4000,
      title: (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-green-600" />
          <span>已加入購物車</span>
        </div>
      ),
      description: (
        <div className="space-y-2 text-sm">
          {/* 電影名稱 */}
          <div className="font-semibold text-gray-900">{movie.title}</div>

          {/* 日期時間 */}
          <div className="flex items-center gap-2 text-gray-700">
            <span>
              {new Date(screening.date).toLocaleDateString('zh-TW', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </span>
            <span>•</span>
            <span>{screening.start_time}</span>
          </div>

          {/* 廳別與格式 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{hall.hall_name}</span>
            <Badge variant={screening.format === 'IMAX' ? 'default' : 'secondary'}>
              {screening.format}
            </Badge>
          </div>

          {/* 座位清單 */}
          <div className="flex flex-wrap gap-1">
            <span className="text-gray-600">座位：</span>
            {seats.map((seat, idx) => (
              <span key={seat} className="text-gray-900 font-medium">
                {seat}
                {idx < seats.length - 1 && ', '}
              </span>
            ))}
          </div>

          {/* 金額 */}
          <div className="text-base font-bold text-green-600 pt-1">
            NT$ {totalPrice.toLocaleString()}
          </div>
        </div>
      ),
      action: (
        <div className="flex flex-col gap-2 w-full">
          <Button
            size="sm"
            onClick={() => navigate('/cart')}
            className="w-full justify-between"
          >
            前往購物車
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Toast 會自動關閉
            }}
            className="w-full"
          >
            繼續選購
          </Button>
        </div>
      ),
    })
  }

  return { showAddToCartToast }
}

