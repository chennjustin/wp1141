'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface DraftPayload {
  id?: string
  content?: string | null
  mediaUrl?: string | null
  mediaType?: 'image' | 'video' | null
}

interface PostModalContextType {
  isOpen: boolean
  openModal: (draft?: DraftPayload | null) => void
  closeModal: () => void
  initialDraft: DraftPayload | null
  clearDraft: () => void
}

const PostModalContext = createContext<PostModalContextType | undefined>(undefined)

export function PostModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialDraft, setInitialDraft] = useState<DraftPayload | null>(null)

  const openModal = (draft?: DraftPayload | null) => {
    setInitialDraft(draft ?? null)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setInitialDraft(null)
  }

  const clearDraft = () => setInitialDraft(null)

  return (
    <PostModalContext.Provider value={{ isOpen, openModal, closeModal, initialDraft, clearDraft }}>
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

