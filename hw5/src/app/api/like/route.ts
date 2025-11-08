import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse, notFoundResponse } from '@/lib/api-helpers'
import { pusherServer } from '@/lib/pusher/server'
import { PUSHER_EVENTS } from '@/lib/pusher/events'
import { createNotification } from '@/lib/notification-helpers'

export const runtime = 'nodejs'

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

    const { postId } = await req.json()

    if (!postId || typeof postId !== 'string') {
      return badRequestResponse('postId is required')
    }

    // 檢查貼文是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return notFoundResponse('Post not found')
    }

    // 檢查是否已經按讚
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: currentUserId,
          postId,
        },
      },
    })

    let liked: boolean
    if (existingLike) {
      // 取消按讚
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: currentUserId,
            postId,
          },
        },
      })
      liked = false
    } else {
      // 按讚
      await prisma.like.create({
        data: {
          userId: currentUserId,
          postId,
        },
      })
      liked = true

      // 建立通知（不通知自己）
      if (post.authorId && post.authorId !== currentUserId) {
        await createNotification(prisma, 'like', currentUserId, post.authorId, postId)
      }
    }

    // Get updated likeCount
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    const likeCount = updatedPost?._count.likes || 0

    // Trigger Pusher events
    try {
      const pusher = pusherServer()
      await Promise.all([
        pusher.trigger('feed', PUSHER_EVENTS.POST_LIKED, {
          postId,
          likeCount,
        }),
        pusher.trigger(`post-${postId}`, PUSHER_EVENTS.POST_LIKED, {
          postId,
          likeCount,
        }),
      ])
    } catch (pusherError) {
      console.error('Error triggering Pusher event:', pusherError)
      // Don't fail the request if Pusher fails
    }

    return NextResponse.json({ liked, likeCount })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

