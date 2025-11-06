'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PostModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const PostModalContext = createContext<PostModalContextType | undefined>(undefined)

export function PostModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <PostModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </PostModalContext.Provider>
  )
}

export function usePostModal() {
  const context = useContext(PostModalContext)
  if (context === undefined) {
    throw new Error('usePostModal must be used within a PostModalProvider')
  }
  return context
}

