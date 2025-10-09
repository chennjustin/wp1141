import { motion } from 'framer-motion'
import { Search, Calendar, ShoppingCart, CheckCircle, X, Sparkles } from 'lucide-react'
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
      color: 'from-blue-500/20 to-blue-600/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      icon: Calendar,
      title: '2. 選擇場次與座位',
      description: '在電影詳情頁選擇適合的場次時間，然後挑選您喜歡的座位',
      tips: ['查看不同日期和時段的場次', '支援 2D、3D、IMAX 等格式', '視覺化座位圖讓選位更輕鬆'],
      color: 'from-purple-500/20 to-purple-600/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      icon: ShoppingCart,
      title: '3. 加入購物車並結帳',
      description: '將選好的場次與座位加入購物車，可以一次訂購多場電影，最後前往結帳',
      tips: ['購物車可修改座位或刪除項目', '查看訂單總金額', '完成訂票並查看歷史記錄'],
      color: 'from-green-500/20 to-green-600/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      {/* 背景裝飾 */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

      {/* 主要內容容器 */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all z-10 hover:rotate-90 duration-300 group"
          aria-label="關閉"
        >
          <X className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
        </button>

        {/* 頂部裝飾條 */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* 標題區 */}
        <div className="text-center px-8 pt-12 pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 mb-6 shadow-lg"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            歡迎來到 Cinema Booking
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            跟著以下三個簡單步驟，輕鬆完成線上訂票，開啟您的觀影之旅 🎬
          </motion.p>
        </div>

        {/* 步驟卡片 */}
        <div className="px-8 pb-8 space-y-5">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.15 }}
                className={`relative flex gap-5 p-6 bg-gradient-to-r ${step.color} rounded-xl border border-gray-200/50 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group`}
              >
                {/* 步驟編號裝飾 */}
                <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                {/* 圖示 */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${step.iconColor}`} />
                  </div>
                </div>

                {/* 內容 */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {step.description}
                  </p>

                  {/* 提示列表 */}
                  <ul className="space-y-2 pt-2">
                    {step.tips.map((tip, tipIndex) => (
                      <motion.li
                        key={tipIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.15 + tipIndex * 0.1 }}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 底部動作區 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-8 border-t border-gray-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              onClick={onClose}
              size="lg"
              className="px-12 py-6 text-lg font-bold shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500/50"
            >
              我了解了，開始使用
            </Button>

            <p className="text-center text-sm text-gray-500 leading-relaxed">
              您可以隨時點擊導覽列的「
              <span className="inline-flex items-center mx-1 text-primary font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              」圖示再次查看此說明
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default UsageGuide

