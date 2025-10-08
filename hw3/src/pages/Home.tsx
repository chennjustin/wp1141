import { Link } from 'react-router-dom'
import { Film, Calendar, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PopularMovies from '@/components/PopularMovies'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 熱門電影統計 */}
      <PopularMovies />
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900">
          歡迎來到 Cinema Booking System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          輕鬆瀏覽電影、選擇場次、劃位訂票，享受最佳的觀影體驗
        </p>
        <div className="pt-4">
          <Link to="/movies">
            <Button size="lg" className="text-lg">
              開始訂票
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Film className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">瀏覽電影</CardTitle>
            <CardDescription className="text-center">
              查看目前上映的所有電影資訊
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-600">
            包含電影簡介、類型、片長、年份等詳細資訊
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">選擇場次</CardTitle>
            <CardDescription className="text-center">
              多種場次時段任您挑選
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-600">
            支援 2D、3D、IMAX 等不同格式
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">選位結帳</CardTitle>
            <CardDescription className="text-center">
              選擇喜愛的座位並完成訂票
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-600">
            購物車功能讓您可以一次訂購多場電影
          </CardContent>
        </Card>
      </section>

      <section className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">使用說明</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>點擊「電影列表」瀏覽目前上映的電影</li>
          <li>選擇您想觀看的電影，查看詳細資訊與場次</li>
          <li>選擇適合的場次時間與播放格式</li>
          <li>選擇您喜愛的座位（可多選）</li>
          <li>加入購物車，您可以繼續選購其他電影</li>
          <li>前往購物車確認訂單內容</li>
          <li>送出訂單完成訂票</li>
        </ol>
      </section>
    </div>
  )
}

