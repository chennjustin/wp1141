import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovieContext, CartItem } from '@/context/MovieContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, ShoppingCart, Calendar, Clock, MapPin, Ticket, PartyPopper } from 'lucide-react'

interface Order {
  orderId: string
  timestamp: string
  items: CartItem[]
  total: number
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useMovieContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [orderId, setOrderId] = useState('')

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.screening.price_TWD) * item.seats.length,
    0
  )

  const totalTickets = cart.reduce((sum, item) => sum + item.seats.length, 0)

  const generateOrderId = () => {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase()
  }

  const handleSubmitOrder = () => {
    setIsProcessing(true)

    // 模擬訂單處理
    setTimeout(() => {
      const newOrderId = generateOrderId()
      
      // 建立訂單物件
      const order: Order = {
        orderId: newOrderId,
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: totalAmount,
      }

      // 存入 localStorage
      const existingOrders = localStorage.getItem('cinema_orders')
      const orders = existingOrders ? JSON.parse(existingOrders) : []
      orders.push(order)
      localStorage.setItem('cinema_orders', JSON.stringify(orders))

      setOrderId(newOrderId)
      setIsProcessing(false)
      setIsCompleted(true)
      clearCart()

      // 3 秒後導向歷史訂單頁
      setTimeout(() => {
        navigate('/history')
      }, 3000)
    }, 2000)
  }

  // 訂單完成頁面
  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
        <Card className="border-2 border-green-500 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="h-12 w-12 text-white animate-in zoom-in duration-500" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <PartyPopper className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-3xl text-green-700">訂單成功！</CardTitle>
              <PartyPopper className="h-6 w-6 text-yellow-500" />
            </div>
            <CardDescription className="text-lg">
              感謝您的訂購，祝您觀影愉快！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center border-2 border-green-200">
              <p className="text-gray-700 mb-2">訂單編號</p>
              <p className="text-2xl font-bold text-green-700 font-mono">
                {orderId}
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <p>訂單已送出</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <p>付款已完成</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <p>電子票券已發送至您的信箱</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-center text-sm text-gray-600">
              <p>🎬 正在為您跳轉至歷史訂單頁面...</p>
            </div>

            <div className="pt-4 space-y-3">
              <Button className="w-full" size="lg" onClick={() => navigate('/history')}>
                查看歷史訂單
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/movies')}
              >
                繼續選購
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 購物車空的狀態
  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <ShoppingCart className="h-24 w-24 mx-auto text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600">購物車是空的</h2>
        <p className="text-gray-500">請先選擇電影和座位</p>
        <Button onClick={() => navigate('/movies')} size="lg">
          前往選購
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 標題與返回按鈕 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">確認訂單</h1>
          <p className="text-gray-600 mt-1">
            請確認您的訂單內容，確認無誤後即可送出訂單
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/cart')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回購物車
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 訂單明細 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                訂單明細
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className={`pb-4 ${index < cart.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.movie.poster_url}
                      alt={item.movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold">{item.movie.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(item.screening.date).toLocaleDateString('zh-TW')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{item.screening.start_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{item.hall.hall_name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {item.screening.format}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">座位</p>
                        <div className="flex flex-wrap gap-1">
                          {item.seats.map((seat) => (
                            <Badge key={seat} variant="outline" className="text-xs font-mono">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {item.seats.length} 張
                      </p>
                      <p className="font-bold text-primary">
                        NT$ {(parseFloat(item.screening.price_TWD) * item.seats.length).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 訂單摘要 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>訂單摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>訂單數量</span>
                  <span className="font-semibold">{cart.length} 筆</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>票券總數</span>
                  <span className="font-semibold">{totalTickets} 張</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">總金額</span>
                    <span className="text-2xl font-bold text-primary">
                      NT$ {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      處理中...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      確認送出訂單
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>✓ 安全加密連線</p>
                  <p>✓ 訂單送出後將無法修改</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 注意事項 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">注意事項</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 電子票券將於付款完成後發送至您的信箱</li>
            <li>• 請於觀影當日提早 15 分鐘到場報到</li>
            <li>• 電影開演後 15 分鐘內可入場，逾時不候</li>
            <li>• 訂單送出後將無法取消或退票</li>
            <li>• 如有任何問題，請洽客服專線 0800-123-456</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

