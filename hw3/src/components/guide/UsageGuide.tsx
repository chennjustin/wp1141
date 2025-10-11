import { motion } from 'framer-motion'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface UsageGuideProps {
  onClose: () => void
}

const UsageGuide = ({ onClose }: UsageGuideProps) => {
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      number: '01',
      title: '在大廳瀏覽電影',
      content: '首頁上方會展示熱門或即將上映的電影輪播。向下可以瀏覽「現正熱映」區域，點選任一部即可查看劇情與預告片。'
    },
    {
      number: '02',
      title: '使用電影列表與搜尋功能',
      content: '進入電影列表頁面後，可以依分類篩選，或利用搜尋欄找到你想看的電影。點擊電影卡片即可查看放映時段與票價。'
    },
    {
      number: '03',
      title: '選擇場次與座位',
      content: '在想看的電影中選擇場次後，即可進入座位選擇畫面。白色代表可選、藍色代表已選、紅色代表售出。'
    }
  ]

  // 檢查滾動狀態
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    setCanScrollUp(scrollTop > 10)
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10)
  }

  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  const handleScroll = (direction: 'up' | 'down') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = direction === 'down' ? 250 : -250
    container.scrollBy({ top: scrollAmount, behavior: 'smooth' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-white/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full bg-white"
        style={{ maxWidth: '650px', maxHeight: '85vh' }}
      >
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-3 text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="關閉"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 可滾動容器 */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto [&::-webkit-scrollbar]:hidden px-12 py-12"
          style={{ 
            scrollbarWidth: 'none',
            maxHeight: '85vh'
          }}
        >
          {/* 標題區 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mb-16"
          >
            <h1 className="text-2xl font-semibold text-black mb-3" style={{ letterSpacing: '-0.02em' }}>
              CHCCCinema 使用說明
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              歡迎使用 CHCCCinema 線上訂票系統，以下將引導你快速了解主要功能與操作步驟。
            </p>
          </motion.div>

          {/* 三個步驟 */}
          <div className="space-y-12 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15, ease: 'easeOut' }}
                className="flex gap-6"
              >
                {/* 左側標號 */}
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-[#D61F26]" style={{ letterSpacing: '-0.03em' }}>
                    {step.number}
                  </span>
                </div>

                {/* 右側內容 */}
                <div className="flex-1 pt-1">
                  <h2 className="text-lg font-semibold text-black mb-2">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed" style={{ color: '#555' }}>
                    {step.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部按鈕 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <button
              onClick={onClose}
              className="border-2 border-[#D61F26] text-[#D61F26] hover:bg-[#D61F26] hover:text-white transition-all duration-300 px-10 py-2.5 font-semibold text-sm tracking-wide"
            >
              開始使用 CHCCCinema
            </button>
          </motion.div>
        </div>

        {/* 右下角浮動導覽箭頭 */}
        {(canScrollUp || canScrollDown) && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-30">
            {canScrollUp && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleScroll('up')}
                className="p-2.5 bg-transparent border border-gray-300 hover:border-[#D61F26] hover:text-[#D61F26] rounded-full transition-all duration-300"
                aria-label="向上滾動"
              >
                <ChevronUp className="h-4 w-4 text-gray-600" />
              </motion.button>
            )}
            {canScrollDown && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleScroll('down')}
                className="p-2.5 bg-transparent border border-gray-300 hover:border-[#D61F26] hover:text-[#D61F26] rounded-full transition-all duration-300"
                aria-label="向下滾動"
              >
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default UsageGuide
