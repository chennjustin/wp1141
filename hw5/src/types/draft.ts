export interface Draft {
  id: string
  content: string | null
  mediaUrl: string | null
  mediaType: 'image' | 'video' | null
  createdAt: string
  updatedAt: string
}
