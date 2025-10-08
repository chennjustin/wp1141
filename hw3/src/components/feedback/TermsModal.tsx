import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  // ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 防止背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // 點擊背景關閉
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 標題列 */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">訂票須知與注意事項</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="關閉"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* 內容 */}
            <div className="px-6 py-6 space-y-6">
              {/* 訂票規則 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 訂票規則</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>每筆訂單最多可訂購 10 張票券</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>同一場次的座位必須在同一訂單中完成</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>訂單完成後將無法修改場次，僅能取消重新訂購</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>請於開演前 30 分鐘完成取票，逾時不候</span>
                  </li>
                </ul>
              </div>

              {/* 退票說明 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 退票與改期</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>開演前 2 小時可免費退票，退款將在 3-5 個工作天退回原付款帳戶</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>開演前 2 小時內退票需收取 20% 手續費</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>開演後恕不接受退票</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>改期視同退票重訂，需依照退票規則辦理</span>
                  </li>
                </ul>
              </div>

              {/* 分級說明 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔞 分級規定</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>限制級（R）：未滿 18 歲者不得觀賞</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>輔導級（PG）：未滿 12 歲者需家長陪同</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>保護級（P）：6 歲以下不得觀賞，6-12 歲需家長陪同</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>入場時請攜帶證件以供查驗</span>
                  </li>
                </ul>
              </div>

              {/* 客服資訊 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📞 客服資訊</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>客服專線：<span className="font-semibold text-primary">0800-123-456</span></p>
                  <p>服務時間：每日 09:00 - 22:00</p>
                  <p>客服信箱：<span className="font-semibold text-primary">support@cinema.com</span></p>
                </div>
              </div>
            </div>

            {/* 底部按鈕 */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <Button onClick={onClose} className="w-full" size="lg">
                我已閱讀並同意
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

