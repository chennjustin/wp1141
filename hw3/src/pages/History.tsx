import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History as HistoryIcon, Calendar, Clock, MapPin, Ticket, Film } from 'lucide-react'

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
      <div className="flex items-center gap-3">
        <HistoryIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">歷史訂單</h1>
          <p className="text-gray-600 mt-1">共 {orders.length} 筆訂單</p>
        </div>
      </div>

      {/* 訂單列表 */}
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.orderId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-xl font-mono">
                    訂單編號：{order.orderId}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    訂購時間：{formatDate(order.timestamp)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  NT$ {order.total.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 ${
                      index < order.items.length - 1 ? 'pb-4 border-b' : ''
                    }`}
                  >
                    {/* 電影海報 */}
                    <img
                      src={item.movie.poster_url}
                      alt={item.movie.title}
                      className="w-16 h-24 object-cover rounded-md shadow-sm"
                    />

                    {/* 訂單資訊 */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg">{item.movie.title}</h3>

                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(item.screening.date).toLocaleDateString('zh-TW', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {item.screening.start_time} - {item.screening.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{item.hall.hall_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.screening.format}</Badge>
                          <span className="text-sm text-gray-600">
                            NT$ {item.screening.price_TWD}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <Ticket className="h-4 w-4 mt-0.5 text-gray-600" />
                        <div>
                          <span className="text-gray-600">座位：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.seats.map((seat) => (
                              <Badge key={seat} variant="outline" className="font-mono text-xs">
                                {seat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm text-gray-600">小計：</span>
                        <span className="font-bold text-primary ml-2">
                          NT${' '}
                          {(
                            parseFloat(item.screening.price_TWD) * item.seats.length
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

