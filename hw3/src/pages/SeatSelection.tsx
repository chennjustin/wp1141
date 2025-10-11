import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, ShoppingCart, Check, AlertCircle } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'
import SeatMap from '@/components/SeatMap'
import { useSoldSeats } from '@/hooks/useSoldSeats'
import AddToCartModal from '@/components/feedback/AddToCartModal'
import { useToast } from '@/components/feedback/Toaster'

interface LocationState {
  editMode?: boolean
  editItemId?: string
  editSeats?: string[]
}

export default function SeatSelection() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { movies, screenings, halls, addToCart, updateCartItem } = useMovieContext()
  const { addToast } = useToast()
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)

  // 從 URL Query 讀取 screening_id
  const screeningId = searchParams.get('screening')

  // 從 location.state 獲取編輯模式資料
  const state = location.state as LocationState | null
  const isEditMode = state?.editMode || false
  const editItemId = state?.editItemId
  const editSeats = state?.editSeats

  // 根據 screening_id 從 context 找到對應資料
  const { screening, movie, hall } = useMemo(() => {
    if (!screeningId) return { screening: null, movie: null, hall: null }

    const foundScreening = screenings.find((s) => s.screening_id === screeningId)
    if (!foundScreening) return { screening: null, movie: null, hall: null }

    const foundMovie = movies.find((m) => m.movie_id === foundScreening.movie_id)
    const foundHall = halls.find((h) => h.hall_id === foundScreening.hall_id)

    return {
      screening: foundScreening,
      movie: foundMovie || null,
      hall: foundHall || null,
    }
  }, [screeningId, screenings, movies, halls])

  // 編輯模式：預載原有座位
  useEffect(() => {
    if (isEditMode && editSeats) {
      setSelectedSeats(editSeats)
    }
  }, [isEditMode, editSeats])

  // 如果缺少 screening_id 或找不到資料，顯示提示
  if (!screeningId || !screening || !movie || !hall) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-16 w-16 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-600">缺少場次資訊</h2>
        <p className="text-gray-500 text-center max-w-md">
          {!screeningId
            ? '請從電影詳情頁選擇場次'
            : '找不到該場次資料，可能已下架或不存在'}
        </p>
        <button 
          onClick={() => navigate(id ? `/movie/${id}` : '/movies')}
          className="bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 transition-colors"
        >
          {id ? '返回電影詳情' : '返回電影列表'}
        </button>
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
        
        // 顯示更新成功 Toast
        addToast({
          variant: 'success',
          duration: 3000,
          title: '✅ 座位已更新！',
          description: '您的座位選擇已成功更新',
        })
        
        // 延遲導航，讓用戶看到 Toast
        setTimeout(() => {
          navigate('/cart')
        }, 300)
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
        // 顯示加入購物車 Modal
        setShowAddToCartModal(true)
      }, 500)
    }
  }

  // 計算總價
  const totalPrice = parseFloat(screening.price_TWD) * selectedSeats.length

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-10 px-6 space-y-10">
        {/* 返回按鈕 */}
        <button 
          onClick={() => navigate(`/movie/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回電影詳情
        </button>

        {/* 電影資訊列 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{movie.title}</h2>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(screening.date).toLocaleDateString('zh-TW', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {screening.start_time} - {screening.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{hall.hall_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                    {screening.format}
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    NT$ {screening.price_TWD}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 座位選擇區域 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
            {isEditMode ? '修改座位選擇' : '選擇座位'}
          </h3>
          
          {/* 座位圖例 - 融入到座位選擇區域 */}
          <div className="flex items-center justify-center gap-6 text-gray-700 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
              <span className="text-sm">可選</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded shadow-sm"></div>
              <span className="text-sm">已選</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded opacity-60"></div>
              <span className="text-sm">售出</span>
            </div>
          </div>
          
          {/* 螢幕區 - 圖二範例樣式 */}
          <div className="text-center mb-6">
            <div className="relative w-full h-5 bg-gradient-to-b from-gray-200 to-gray-400 mx-auto mb-2 shadow-inner border border-gray-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-700 font-bold text-sm">銀幕</span>
              </div>
              {/* 銀幕光澤效果 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </div>

          <SeatMap
            seatmapId={hall.seatmap_id}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            soldSeats={soldSeats}
          />
        </div>

        {/* 確認按鈕區域 */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* 確認按鈕 移到右邊*/}
          {selectedSeats.length > 0 && (
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  已選 {selectedSeats.length} 個座位
                </p>
                <p className="text-2xl font-bold text-red-600">
                  NT$ {totalPrice.toLocaleString()}
                </p>
              </div>
              {/* 確認按鈕 要是紅色的*/}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 font-semibold transition-all duration-200 hover:shadow-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <>
                    <Check className="inline mr-2 h-5 w-5" />
                    {isEditMode ? '更新中...' : '加入中...'}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="inline mr-2 h-5 w-5" />
                    {isEditMode ? '更新購物車' : '確認訂票'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 加入購物車成功 Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        movie={movie}
        screening={screening}
        hall={hall}
        seats={selectedSeats}
      />
    </div>
  )
}

