import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
  isOpen: boolean
  content: ReactNode | null
  openUsageGuide: () => void
  closeModal: () => void
  openModal: (content: ReactNode) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState<ReactNode | null>(null)

  const openModal = (modalContent: ReactNode) => {
    setContent(modalContent)
    setIsOpen(true)
    // 防止背景滾動
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsOpen(false)
    setContent(null)
    // 恢復滾動
    document.body.style.overflow = 'unset'
  }

  const openUsageGuide = () => {
    // 這裡會被 UsageGuide 組件填充
    // 使用動態導入避免循環依賴
    import('@/components/guide/UsageGuide').then((module) => {
      const UsageGuide = module.default
      openModal(<UsageGuide onClose={closeModal} />)
    })
  }

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        content,
        openUsageGuide,
        closeModal,
        openModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}

