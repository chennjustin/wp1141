import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import HeroCarousel from '@/components/home/HeroCarousel'
import { useModal } from '@/context/ModalContext'

export default function Home() {
  const { openUsageGuide } = useModal()

  // 首次進站自動彈出使用教學
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('cbx_seen_guide')
    if (!hasSeenGuide) {
      // 延遲一下讓頁面先渲染
      const timer = setTimeout(() => {
        openUsageGuide()
        localStorage.setItem('cbx_seen_guide', '1')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [openUsageGuide])

  return (
    <div className="space-y-8">
      {/* Hero 輪播 */}
      <HeroCarousel />
      
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
    </div>
  )
}

