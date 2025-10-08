import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, ShoppingCart, Check } from 'lucide-react'
import { useMovieContext, Movie, Screening, Hall } from '@/context/MovieContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SeatMap from '@/components/SeatMap'
import { useSoldSeats } from '@/hooks/useSoldSeats'

interface LocationState {
  screening?: Screening
  movie?: Movie
  hall?: Hall
  editMode?: boolean
  editItemId?: string
  editSeats?: string[]
}

export default function SeatSelection() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart, updateCartItem } = useMovieContext()
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)

  // 從 location.state 獲取資料
  const state = location.state as LocationState | null
  const screening = state?.screening
  const movie = state?.movie
  const hall = state?.hall
  const isEditMode = state?.editMode || false
  const editItemId = state?.editItemId
  const editSeats = state?.editSeats

  // 如果沒有必要資料，導回電影詳情頁（只執行一次）
  useEffect(() => {
    if (!screening || !movie || !hall) {
      navigate(`/movie/${id}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在首次載入時檢查

  // 編輯模式：預載原有座位
  useEffect(() => {
    if (isEditMode && editSeats) {
      setSelectedSeats(editSeats)
    }
  }, [isEditMode, editSeats])

  // 如果資料不完整，顯示載入中（在導航前的短暫顯示）
  if (!screening || !movie || !hall) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">載入中...</p>
      </div>
    )
  }

  // 取得座位總數
  const totalSeats = parseInt(hall.capacity)

  // 生成隨機已售座位
  const soldSeats = useSoldSeats(
    screening.screening_id,
    totalSeats
  )

  // 處理座位點擊
  const handleSeatClick = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    )
  }

  // 加入或更新購物車
  const handleAddToCart = () => {
    if (selectedSeats.length === 0) return

    setIsAdding(true)

    if (isEditMode && editItemId) {
      // 編輯模式：更新現有項目
      updateCartItem(editItemId, {
        screening: screening,
        seats: [...selectedSeats],
      })
      
      setTimeout(() => {
        setIsAdding(false)
        alert('✅ 座位已更新！')
        navigate('/cart')
      }, 500)
    } else {
      // 新增模式：加入新項目
      const cartItem = {
        id: `${screening.screening_id}-${Date.now()}`,
        screening: screening,
        movie: movie,
        hall: hall,
        seats: [...selectedSeats],
      }

      addToCart(cartItem)

      setTimeout(() => {
        setIsAdding(false)
        alert('✅ 已加入購物車！')
        navigate('/cart')
      }, 500)
    }
  }

  // 計算總價
  const totalPrice = parseFloat(screening.price_TWD) * selectedSeats.length

  return (
    <div className="space-y-6 pb-24">
      {/* 返回按鈕 */}
      <Button variant="ghost" onClick={() => navigate(`/movie/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回電影詳情
      </Button>

      {/* 場次資訊卡片 */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(screening.date).toLocaleDateString('zh-TW', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    {screening.start_time} - {screening.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4" />
                  <span>{hall.hall_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={screening.format === 'IMAX' ? 'default' : 'secondary'}>
                    {screening.format}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">
                    NT$ {screening.price_TWD}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 座位選擇區域 */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditMode ? '修改座位選擇' : '選擇座位'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeatMap
            seatmapId={hall.seatmap_id}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            soldSeats={soldSeats}
          />
        </CardContent>
      </Card>

      {/* 底部固定的操作按鈕 */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">
                  已選 {selectedSeats.length} 個座位
                </p>
                <p className="text-2xl font-bold text-primary">
                  NT$ {totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSeats([])}
                  className="flex-1 sm:flex-none"
                >
                  清除座位
                </Button>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="px-8 flex-1 sm:flex-none"
                >
                  {isAdding ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      {isEditMode ? '更新中...' : '加入中...'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isEditMode ? '更新購物車' : '加入購物車'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

