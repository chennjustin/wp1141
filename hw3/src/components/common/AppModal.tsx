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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* 標題列 */}
            {title && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b">
                <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                  {title}
                </h2>
                <button
                  ref={firstFocusableRef}
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="關閉"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* 內容 */}
            <div className="px-6 py-4">{children}</div>

            {/* 動作按鈕 */}
            {(primaryAction || secondaryAction) && (
              <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AppModal

