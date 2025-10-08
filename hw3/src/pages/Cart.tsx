import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovieContext } from '@/context/MovieContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShoppingCart, Trash2, Film, Calendar, Clock, MapPin, Edit, Info, CreditCard, FileText } from 'lucide-react'
import TermsModal from '@/components/feedback/TermsModal'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, clearCart } = useMovieContext()
  const [showTermsModal, setShowTermsModal] = useState(false)

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.screening.price_TWD) * item.seats.length,
    0
  )

  const totalTickets = cart.reduce((sum, item) => sum + item.seats.length, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    navigate('/checkout')
  }

  // 空購物車狀態
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">購物車是空的</AlertTitle>
          <AlertDescription className="text-blue-700">
            目前沒有訂單項目，趕快選購您喜愛的電影吧！
          </AlertDescription>
        </Alert>
        
        <div className="text-center py-16 space-y-4">
          <ShoppingCart className="h-24 w-24 mx-auto text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-600">開始您的觀影之旅</h2>
          <p className="text-gray-500">瀏覽熱門電影，選擇您喜愛的場次</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/movies')} size="lg">
              <Film className="mr-2 h-4 w-4" />
              瀏覽電影
            </Button>
            <Button onClick={() => navigate('/history')} size="lg" variant="outline">
              查看歷史訂單
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-32">
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">購物車</h1>
        <p className="text-gray-600 mt-1">確認您的訂單詳情</p>
      </div>

      {/* 上半部：購物車摘要 */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 訂單數量 */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 mb-1">訂單數量</p>
            <p className="text-2xl font-bold text-gray-900">{cart.length} 筆</p>
          </div>

          {/* 總票數 */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 mb-1">票券總數</p>
            <p className="text-2xl font-bold text-gray-900">{totalTickets} 張</p>
          </div>

          {/* 總金額 */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 mb-1">總金額</p>
            <p className="text-3xl font-bold text-primary">
              NT$ {totalAmount.toLocaleString()}
            </p>
          </div>

          {/* 清空購物車按鈕 */}
          <div className="flex items-end justify-center md:justify-end">
            <Button 
              variant="destructive" 
              onClick={clearCart}
              className="w-full md:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空購物車
            </Button>
          </div>
        </div>
      </div>

      {/* 中段：訂單卡片列表 */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => {
          const itemTotal = parseFloat(item.screening.price_TWD) * item.seats.length

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                {/* 左側：電影海報 */}
                <div className="flex-shrink-0 w-full sm:w-40 md:w-48">
                  <img
                    src={item.movie.poster_url}
                    alt={item.movie.title}
                    className="w-full h-48 sm:h-full object-cover"
                  />
                </div>

                {/* 右側：資訊區 */}
                <div className="flex-1 p-4 md:p-6">
                  {/* 頂部：電影名稱 + 操作按鈕 */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4">
                      {item.movie.title}
                    </h3>
                    
                    {/* 操作按鈕 */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          navigate(`/movie/${item.movie.movie_id}/select-seat?screening=${item.screening.screening_id}`, {
                            state: {
                              editMode: true,
                              editItemId: item.id,
                              editSeats: item.seats,
                            },
                          })
                        }
                        title="修改座位"
                        className="hover:border-primary hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        title="刪除訂單"
                        className="hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 場次資訊 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(item.screening.date).toLocaleDateString('zh-TW', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{item.screening.start_time} - {item.screening.end_time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{item.hall.hall_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={item.screening.format === 'IMAX' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.screening.format}
                      </Badge>
                    </div>
                  </div>

                  {/* 座位 */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">已選座位</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.seats.map((seat) => (
                        <span
                          key={seat}
                          className="inline-flex items-center px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-md text-sm font-medium text-primary"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 小計 */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      {item.seats.length} 張票 × NT$ {item.screening.price_TWD}
                    </p>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">小計</p>
                      <p className="text-2xl font-bold text-primary">
                        NT$ {itemTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 注意事項按鈕 */}
      <div className="text-center mb-6">
        <Button
          variant="outline"
          onClick={() => setShowTermsModal(true)}
          className="text-sm"
        >
          <FileText className="mr-2 h-4 w-4" />
          查看訂票須知與注意事項
        </Button>
      </div>

      {/* 下半部：固定結帳區 (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* 總金額 */}
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600">總金額</p>
              <p className="text-3xl font-bold text-primary">
                NT$ {totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                共 {cart.length} 筆訂單 • {totalTickets} 張票
              </p>
            </div>

            {/* 按鈕組 */}
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => navigate('/movies')}
                className="flex-1 sm:flex-none sm:min-w-[140px]"
                size="lg"
              >
                <Film className="mr-2 h-4 w-4" />
                繼續選購
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 sm:flex-none sm:min-w-[160px] bg-primary hover:bg-primary/90"
                size="lg"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                前往結帳
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  )
}
