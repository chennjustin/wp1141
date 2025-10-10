import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { History as HistoryIcon, Calendar, Clock, MapPin, Film, Trash2, X } from 'lucide-react'

interface OrderItem {
  id: string
  screening: {
    screening_id: string
    date: string
    start_time: string
    end_time: string
    format: string
    price_TWD: string
  }
  movie: {
    movie_id: string
    title: string
    poster_url: string
  }
  hall: {
    hall_name: string
  }
  seats: string[]
}

interface Order {
  orderId: string
  timestamp: string
  items: OrderItem[]
  total: number
}

export default function History() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // 從 localStorage 讀取訂單
    const savedOrders = localStorage.getItem('cinema_orders')
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders)
      // 按時間倒序排列（最新的在前）
      setOrders(parsedOrders.reverse())
    }
  }, [])

  // 清除所有歷史紀錄
  const clearAllHistory = () => {
    if (window.confirm('確定要清除所有歷史訂單嗎？此操作無法復原。')) {
      localStorage.removeItem('cinema_orders')
      setOrders([])
    }
  }

  // 清除單筆訂單
  const clearOrder = (orderId: string) => {
    if (window.confirm('確定要刪除此筆訂單嗎？')) {
      const updatedOrders = orders.filter(order => order.orderId !== orderId)
      setOrders(updatedOrders)
      localStorage.setItem('cinema_orders', JSON.stringify(updatedOrders.reverse()))
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <HistoryIcon className="h-24 w-24 mx-auto text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600">目前沒有歷史訂單</h2>
        <p className="text-gray-500">完成訂票後，訂單記錄會顯示在這裡</p>
        <Button onClick={() => navigate('/movies')} size="lg">
          <Film className="mr-2 h-4 w-4" />
          開始選購
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HistoryIcon className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">歷史訂單</h1>
            <p className="text-gray-600 mt-1">共 {orders.length} 筆訂單</p>
          </div>
        </div>
        {orders.length > 0 && (
          <button 
            onClick={clearAllHistory}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="清除所有紀錄"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 訂單列表 */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
            {/* 標題列 - 收據風格 */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 rounded-t-xl flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="font-bold text-gray-900">訂單編號：{order.orderId}</div>
                <div className="text-sm text-gray-600 mt-1">{formatDate(order.timestamp)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-[#E50914]">
                    NT$ {order.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">總金額</div>
                </div>
                <button
                  onClick={() => clearOrder(order.orderId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="刪除此筆訂單"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 電影票券列 */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start gap-4">
                      {/* 左側小海報 */}
                      <div className="flex-shrink-0 w-16 h-24">
                        <img
                          src={item.movie.poster_url}
                          alt={item.movie.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>

                      {/* 電影資訊 */}
                      <div className="flex-1 min-w-0">
                        {/* 電影名稱 */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.movie.title}
                        </h3>

                        {/* 日期與場次 */}
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(item.screening.date).toLocaleDateString('zh-TW', {
                                month: 'short',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{item.screening.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{item.hall.hall_name}</span>
                          </div>
                        </div>

                        {/* 座位與票種 */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>座位：</span>
                            <div className="flex gap-1">
                              {item.seats.map((seat) => (
                                <span
                                  key={seat}
                                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs"
                                >
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                            {item.screening.format}
                          </span>
                        </div>
                      </div>

                      {/* 右側小計金額 */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-base font-semibold text-gray-800">
                          NT$ {(parseFloat(item.screening.price_TWD) * item.seats.length).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.seats.length} 張 × NT$ {item.screening.price_TWD}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 虛線分隔線（除了最後一筆） */}
                  {index < order.items.length - 1 && (
                    <div className="border-b border-dashed border-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 繼續選購按鈕 */}
      <div className="text-center pt-4">
        <Button onClick={() => navigate('/movies')} size="lg" variant="outline">
          <Film className="mr-2 h-4 w-4" />
          繼續選購電影
        </Button>
      </div>
    </div>
  )
}

