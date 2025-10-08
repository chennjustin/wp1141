import { useNavigate } from 'react-router-dom'
import { useMovieContext } from '@/context/MovieContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShoppingCart, Trash2, Film, Calendar, Clock, MapPin, CreditCard, Edit, Info } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, clearCart } = useMovieContext()

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.screening.price_TWD) * item.seats.length,
    0
  )

  const totalTickets = cart.reduce((sum, item) => sum + item.seats.length, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="info" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>購物車是空的</AlertTitle>
          <AlertDescription>
            目前沒有可修改的訂單，如需訂票請重新選購。
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 標題列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">購物車</h1>
          <p className="text-gray-600 mt-1">
            共 {cart.length} 筆訂單，{totalTickets} 張票
          </p>
        </div>
        <Button variant="destructive" onClick={clearCart}>
          <Trash2 className="mr-2 h-4 w-4" />
          清空購物車
        </Button>
      </div>

      {/* 購物車項目 */}
      <div className="space-y-4">
        {cart.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.movie.poster_url}
                      alt={item.movie.title}
                      className="w-20 h-28 object-cover rounded-md shadow-sm"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{item.movie.title}</CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(item.screening.date).toLocaleDateString('zh-TW', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {item.screening.start_time} - {item.screening.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{item.hall.hall_name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {item.screening.format}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      navigate(`/movie/${item.movie.movie_id}/select-seat`, {
                        state: {
                          screening: item.screening,
                          movie: item.movie,
                          hall: item.hall,
                          editMode: true,
                          editItemId: item.id,
                          editSeats: item.seats,
                        },
                      })
                    }
                    title="修改座位"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="刪除"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-3 border-t">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">座位</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.seats.map((seat) => (
                        <Badge key={seat} variant="outline" className="font-mono">
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    共 {item.seats.length} 張票 × NT$ {item.screening.price_TWD}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">小計</p>
                  <p className="text-2xl font-bold text-primary">
                    NT$ {(parseFloat(item.screening.price_TWD) * item.seats.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 總計與結帳 */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 sticky bottom-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 訂單摘要 */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>訂單數量</span>
                <span>{cart.length} 筆</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>票券總數</span>
                <span>{totalTickets} 張</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">總金額</span>
                  <span className="text-3xl font-bold text-primary">
                    NT$ {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 結帳按鈕 */}
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleCheckout}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              前往結帳
            </Button>

            {/* 繼續購物 */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/movies')}
            >
              <Film className="mr-2 h-4 w-4" />
              繼續選購
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

