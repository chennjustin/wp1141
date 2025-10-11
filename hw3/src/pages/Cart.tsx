import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovieContext } from '@/context/MovieContext'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShoppingCart, Trash2, Film, Calendar, Clock, MapPin, Info, CreditCard, FileText } from 'lucide-react'
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
    <div className="max-w-6xl mx-auto pb-24">
      {/* 上方資訊區 - 重新設計 */}
      <div className="mb-8">
        {/* 主要標題區 */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">購物車</h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>{cart.length} 筆訂單</span>
              <span className="text-gray-400">•</span>
              <span>{totalTickets} 張票</span>
            </div>
          </div>
          
          {/* 總金額 - 突出顯示 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              NT$ {totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">總金額</div>
          </div>
        </div>

        {/* 操作按鈕區 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            請確認您的訂單詳情
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowTermsModal(true)}
              className="text-sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              查看訂票須知與注意事項
            </Button>
            <button 
              onClick={clearCart}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              清空
            </button>
          </div>
        </div>
      </div>

      {/* 電影卡片列表 */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => {
          const itemTotal = parseFloat(item.screening.price_TWD) * item.seats.length

          return (
            <div
              key={item.id}
              className="relative bg-white border-2 border-gray-300 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* 票券撕邊效果 */}
              <div className="relative">
                <div 
                  className="absolute -top-2 left-0 right-0 h-4"
                  style={{
                    background: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 Q10,0 20,10 Q30,20 40,10 Q50,0 60,10 Q70,20 80,10 Q90,0 100,10 L100,20 L0,20 Z' fill='white'/%3E%3C/svg%") repeat-x`,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* 內容區域 */}
                <div className="relative z-10 p-4">
                  {/* 關閉按鈕 */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors z-20"
                    title="刪除訂單"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-start gap-4 pr-8">
                    {/* 左側：電影海報 */}
                    <div className="flex-shrink-0 w-20 h-28">
                      <img
                        src={item.movie.poster_url}
                        alt={item.movie.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* 中間：電影資訊 */}
                    <div className="flex-1 min-w-0">
                      {/* 電影名稱 */}
                      <h3 className="text-base font-bold text-gray-900 mb-2">
                        {item.movie.title}
                      </h3>

                      {/* 電影資訊 Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">日期</p>
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>
                              {new Date(item.screening.date).toLocaleDateString('zh-TW', {
                                month: 'short',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">時間</p>
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{item.screening.start_time}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">影廳</p>
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{item.hall.hall_name}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">票種</p>
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                            {item.screening.format}
                          </span>
                        </div>
                      </div>

                      {/* 座位 */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">座位</p>
                        <div className="flex flex-wrap gap-1">
                          {item.seats.map((seat) => (
                            <span
                              key={seat}
                              className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-md shadow-sm border border-blue-600"
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 右側：金額 */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500 mb-1">小計</p>
                      <p className="text-lg font-bold text-gray-900">
                        NT$ {itemTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.seats.length} 張 × NT$ {item.screening.price_TWD}
                      </p>
                    </div>
                  </div>

                  {/* 虛線分隔 */}
                  <div className="border-b-2 border-dashed border-gray-300 my-3"></div>

                  {/* 金額區塊 */}
                  <div className="py-2 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">
                          {item.seats.length} 張票 × NT$ {item.screening.price_TWD}
                        </p>
                        <p className="text-xs text-gray-500">單價</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">
                          NT$ {itemTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">總金額</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>      

      {/* 下方固定 bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          {/* 左側：總金額與票數 */}
          <div className="text-left">
            <p className="text-lg font-bold text-gray-900">
              NT$ {totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {totalTickets} 張票 • {cart.length} 筆訂單
            </p>
          </div>

          {/* 右側：按鈕組 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/movies')}
              size="sm"
              className="px-4 py-2"
            >
              <Film className="mr-1 h-3 w-3" />
              繼續選購
            </Button>
            <Button
              onClick={handleCheckout}
              size="sm"
              className="px-4 py-2 bg-red-600 hover:bg-red-700"
            >
              <CreditCard className="mr-1 h-3 w-3" />
              前往結帳
            </Button>
          </div>
        </div>
      </div>

      {/* 注意事項 Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  )
}
