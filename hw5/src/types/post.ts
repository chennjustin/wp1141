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
  parent?: {
    id: string
    content: string
    authorId: string
    createdAt: string
    updatedAt: string
    author: {
      id: string
      userId: string | null
      name: string | null
      image: string | null
    }
  } | null // Parent post (if this is a comment/reply)
  depth?: number // 層級深度（用於縮排顯示）
  likeCount: number
  repostCount: number
  commentCount: number
  liked?: boolean // Whether current user has liked this post
  reposted?: boolean // Whether current user has reposted this post
  repostedByMe?: boolean // Whether this post was reposted by the current user (for profile page)
}

