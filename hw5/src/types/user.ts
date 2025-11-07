// User type matching API response
export interface User {
  id: string
  userId: string | null
  name: string | null
  image: string | null
  bio: string | null
  email: string | null
  avatarUrl: string | null
  coverUrl: string | null
  createdAt: string // ISO string
  _count: {
    posts: number
    followers: number
    following: number
  }
}

