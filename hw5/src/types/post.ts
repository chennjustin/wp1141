// Post type matching API response
export interface Post {
  id: string
  content: string
  authorId: string
  createdAt: string // ISO string
  updatedAt: string // ISO string
  author: {
    id: string
    userId: string | null
    name: string | null
    image: string | null
  }
  likeCount: number
  repostCount: number
  commentCount: number
}

