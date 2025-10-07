import { useMovieContext } from '@/context/MovieContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2 } from 'lucide-react'

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useMovieContext()

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.screening.price_TWD) * item.seats.length,
    0
  )

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <ShoppingCart className="h-24 w-24 mx-auto text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600">購物車是空的</h2>
        <p className="text-gray-500">快去選購電影票吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">購物車</h1>
        <Button variant="destructive" onClick={clearCart}>
          清空購物車
        </Button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.movie.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    {item.screening.date} {item.screening.start_time} - {item.screening.end_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.hall.hall_name} • {item.screening.format}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    座位：{item.seats.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    數量：{item.seats.length} 張
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">單價：NT$ {item.screening.price_TWD}</p>
                  <p className="text-lg font-bold">
                    NT$ {parseFloat(item.screening.price_TWD) * item.seats.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>總金額</span>
            <span className="text-primary">NT$ {totalAmount}</span>
          </div>
          <Button className="w-full mt-4" size="lg">
            送出訂單
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

