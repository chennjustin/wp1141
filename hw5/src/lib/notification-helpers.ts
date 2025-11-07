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
 */
export async function createNotification(
  prisma: PrismaClient,
  type: 'like' | 'repost' | 'follow' | 'comment',
  senderId: string,
  receiverId: string,
  postId?: string | null
) {
  // 不通知自己
  if (senderId === receiverId) {
    return
  }

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
    return
  }

  // 建立通知
  const notification = await prisma.notification.create({
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
        },
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
  })

  // 透過 Pusher 推送通知
  try {
    const payload: NotificationCreatedPayload = {
      notification: {
        id: notification.id,
        type: notification.type as 'like' | 'repost' | 'follow' | 'comment',
        senderId: notification.senderId,
        receiverId: notification.receiverId,
        postId: notification.postId,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        sender: serializeAuthor(notification.sender),
        post: notification.post || null,
      },
    }

    await pusherServer().trigger(
      `user-${receiverId}`,
      PUSHER_EVENTS.NOTIFICATION_CREATED,
      payload
    )
  } catch (pusherError) {
    console.error('Error triggering Pusher notification:', pusherError)
    // Don't fail if Pusher fails
  }

  return notification
}

