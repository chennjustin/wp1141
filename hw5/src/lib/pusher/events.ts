// Pusher event names
export const PUSHER_EVENTS = {
  POST_CREATED: 'post:created',
  POST_LIKED: 'post:liked',
  POST_REPOSTED: 'post:reposted',
  POST_REPLIED: 'post:replied',
  NOTIFICATION_CREATED: 'notification:created',
} as const

// Event payload types
export interface PostCreatedPayload {
  post: {
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
      avatarUrl: string | null
      profileImage?: string | null
    }
    likeCount: number
    repostCount: number
    commentCount: number
  }
}

export interface PostLikedPayload {
  postId: string
  likeCount: number
}

export interface PostRepostedPayload {
  postId: string
  repostCount: number
}

export interface PostRepliedPayload {
  parentId: string
  commentCount: number
}

export interface NotificationCreatedPayload {
  notification: {
    id: string
    type: 'like' | 'repost' | 'follow' | 'comment'
    senderId: string
    receiverId: string
    postId: string | null
    read: boolean
    createdAt: string
    sender: {
      id: string
      userId: string | null
      name: string | null
      image: string | null
      avatarUrl: string | null
      profileImage?: string | null
    }
    post?: {
      id: string
      content: string
    } | null
  }
}

