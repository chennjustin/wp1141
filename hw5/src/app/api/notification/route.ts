import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse } from '@/lib/api-helpers'
import { serializeAuthor } from '@/lib/serializers'
import { pusherServer } from '@/lib/pusher/server'
import { PUSHER_EVENTS } from '@/lib/pusher/events'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const currentUserId = user.id
    if (!currentUserId) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    // 取得使用者的通知
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: currentUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
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
        post: {
          select: {
            id: true,
            content: true,
            authorId: true,
          },
        },
      },
    })

    // 格式化回傳資料
    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      senderId: notification.senderId,
      receiverId: notification.receiverId,
      postId: notification.postId,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      sender: serializeAuthor(notification.sender),
      post: notification.post,
    }))

    // 取得未讀通知數量
    const unreadCount = await prisma.notification.count({
      where: {
        receiverId: currentUserId,
        read: false,
      },
    })

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const currentUserId = user.id
    if (!currentUserId) {
      return unauthorizedResponse()
    }

    const { notificationId } = await req.json()

    if (!notificationId || typeof notificationId !== 'string') {
      return badRequestResponse('notificationId is required')
    }

    // 標記通知為已讀
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    })

    // 取得更新後的未讀通知數量
    const unreadCount = await prisma.notification.count({
      where: {
        receiverId: currentUserId,
        read: false,
      },
    })

    // 透過 Pusher 推送通知已讀事件
    try {
      await pusherServer().trigger(
        `user-${currentUserId}`,
        PUSHER_EVENTS.NOTIFICATION_READ,
        {
          notificationId,
          unreadCount,
        }
      )
    } catch (pusherError) {
      console.error('Error triggering Pusher notification read event:', pusherError)
      // Pusher 失敗不應該影響標記已讀的操作
    }

    return NextResponse.json({ success: true, notification, unreadCount })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

