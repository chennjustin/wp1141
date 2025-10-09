import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

const AppModal = ({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: AppModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      // 焦點鎖定到 Modal
      firstFocusableRef.current?.focus()
    }

    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 點擊遮罩關閉
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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/60 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* 標題列（如果有標題） */}
            {title && (
              <div className="relative bg-white rounded-t-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200 rounded-t-2xl">
                  <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {title}
                  </h2>
                  <button
                    ref={firstFocusableRef}
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all hover:rotate-90 duration-300"
                    aria-label="關閉"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* 內容 */}
                <div className="px-6 py-6">{children}</div>

                {/* 動作按鈕 */}
                {(primaryAction || secondaryAction) && (
                  <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                    {secondaryAction && (
                      <Button variant="outline" onClick={secondaryAction.onClick}>
                        {secondaryAction.label}
                      </Button>
                    )}
                    {primaryAction && (
                      <Button onClick={primaryAction.onClick}>
                        {primaryAction.label}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 無標題時的內容（例如 UsageGuide 已經有自己的關閉按鈕和樣式） */}
            {!title && children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AppModal

