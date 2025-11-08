import { PrismaClient } from '@prisma/client'
import { pusherServer } from './pusher/server'
import { PUSHER_EVENTS, NotificationCreatedPayload } from './pusher/events'
import { serializeAuthor } from './serializers'

/**
 * 建立通知並透過 Pusher 推送
 * @param prisma Prisma client instance
 * @param type 通知類型
 * @param senderId 發送者 ID
 * @param receiverId 接收者 ID
 * @param postId 貼文 ID（可選，follow 類型不需要）
 * @returns 建立的通知，如果失敗則返回 null
 */
export async function createNotification(
  prisma: PrismaClient,
  type: 'like' | 'repost' | 'follow' | 'comment' | 'mention',
  senderId: string,
  receiverId: string,
  postId?: string | null
) {
  // 不通知自己
  if (senderId === receiverId) {
    return null
  }

  // 驗證參數
  if (!senderId || !receiverId) {
    console.error('Invalid notification parameters: senderId or receiverId is missing')
    return null
  }

  try {
    // 檢查是否已存在相同的通知（避免重複通知）
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type,
        senderId,
        receiverId,
        postId: postId || null,
        read: false,
        createdAt: {
          gte: new Date(Date.now() - 60000), // 1 分鐘內
        },
      },
    })

    if (existingNotification) {
      return null
    }

    // 建立通知
    const notification = (await prisma.notification.create({
      data: {
        type,
        senderId,
        receiverId,
        postId: postId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
            avatarUrl: true,
          } as any,
        },
        post: postId
          ? {
              select: {
                id: true,
                content: true,
              },
            }
          : undefined,
      },
    }) as unknown) as {
      id: string
      type: string
      senderId: string
      receiverId: string
      postId: string | null
      read: boolean
      createdAt: Date
      sender: {
        id: string
        userId: string | null
        name: string | null
        image: string | null
        avatarUrl: string | null
      }
      post: {
        id: string
        content: string
      } | null
    }

    // 透過 Pusher 推送通知
    try {
      const payload: NotificationCreatedPayload = {
        notification: {
          id: notification.id,
          type: notification.type as 'like' | 'repost' | 'follow' | 'comment' | 'mention',
          senderId: notification.senderId,
          receiverId: notification.receiverId,
          postId: notification.postId,
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
          sender: serializeAuthor(notification.sender),
          post: notification.post
            ? {
                id: notification.post.id,
                content: notification.post.content,
              }
            : null,
        },
      }

      await pusherServer().trigger(
        `user-${receiverId}`,
        PUSHER_EVENTS.NOTIFICATION_CREATED,
        payload
      )
    } catch (pusherError) {
      // Pusher 失敗不應該影響通知的建立
      console.error('Error triggering Pusher notification:', pusherError)
    }

    return notification
  } catch (error) {
    // 記錄錯誤但不中斷主流程
    console.error('Error creating notification:', {
      type,
      senderId,
      receiverId,
      postId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

