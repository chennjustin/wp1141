import { Search, Calendar, ShoppingCart, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UsageGuideProps {
  onClose: () => void
}

const UsageGuide = ({ onClose }: UsageGuideProps) => {
  const steps = [
    {
      icon: Search,
      title: '1. 瀏覽電影',
      description: '從電影列表中找到您喜歡的電影，或使用搜尋功能快速找到想看的片子',
      tips: ['查看電影海報、簡介、類型', '使用搜尋框快速篩選', '點擊電影卡片查看詳情'],
    },
    {
      icon: Calendar,
      title: '2. 選擇場次與座位',
      description: '在電影詳情頁選擇適合的場次時間，然後挑選您喜歡的座位',
      tips: ['查看不同日期和時段的場次', '支援 2D、3D、IMAX 等格式', '視覺化座位圖讓選位更輕鬆'],
    },
    {
      icon: ShoppingCart,
      title: '3. 加入購物車並結帳',
      description: '將選好的場次與座位加入購物車，可以一次訂購多場電影，最後前往結帳',
      tips: ['購物車可修改座位或刪除項目', '查看訂單總金額', '完成訂票並查看歷史記錄'],
    },
  ]

  return (
    <div className="relative">
      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        aria-label="關閉"
      >
        <X className="h-5 w-5 text-gray-600" />
      </button>

      {/* 標題 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          歡迎使用 Cinema Booking System
        </h2>
        <p className="text-gray-600">
          跟著以下三個簡單步驟，輕鬆完成線上訂票
        </p>
      </div>

      {/* 步驟卡片 */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div
              key={index}
              className="flex gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-primary/50 transition-colors"
            >
              {/* 圖示 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* 內容 */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-3">{step.description}</p>

                {/* 提示列表 */}
                <ul className="space-y-1">
                  {step.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部按鈕 */}
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={onClose} size="lg" className="px-8">
          開始使用
        </Button>
      </div>

      {/* 提示文字 */}
      <p className="text-center text-sm text-gray-500 mt-4">
        您可以隨時從導覽列的「使用教學」按鈕再次查看此說明
      </p>
    </div>
  )
}

export default UsageGuide

